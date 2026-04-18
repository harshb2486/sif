// OpenAI Chatbot Service
// Handles interactions with OpenAI API and sales context

const { OpenAI } = require('openai');
const logger = require('../utils/logger');
const Product = require('../models/Product');
const User = require('../models/User');

let client = null;

const getOpenAIClient = () => {
  if (client) return client;

  if (!process.env.OPENAI_API_KEY) {
    return null;
  }

  client = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
  });

  return client;
};

/**
 * Build system prompt with sales context
 */
const buildSystemPrompt = (userData, products) => {
  const userName = userData?.userName || userData?.name || 'Sales Representative';
  const companyName = userData?.companyName || userData?.company_name || 'Company';
  const userRole = userData?.userRole || userData?.role || 'sales';

  const productInfo = products
    .map(p => `- ${p.name}: $${p.price} (${p.commission_type === 'fixed' ? `$${p.commission_value}` : p.commission_value + '%'} commission)`)
    .join('\n');

  return `You are a helpful Sales Assistant for the Field Sales Management System. 
Your role is to help sales representatives with:
1. Product information and pricing
2. Commission calculations
3. Sales strategies and tips
4. Customer engagement advice
5. Sales data insights

Sales Representative: ${userName}
Company: ${companyName}
Role: ${userRole}

AVAILABLE PRODUCTS:
${productInfo || 'No products available'}

IMPORTANT GUIDELINES:
- Always be professional and supportive
- Provide accurate commission calculations
- Offer practical sales advice
- Be concise and clear
- If asked about features outside your scope, politely redirect to the appropriate team
- Never provide personal financial or investment advice
- Always prioritize customer satisfaction

Format responses clearly with bullet points when listing information.`;
};

/**
 * Calculate commission for a sale
 */
const calculateCommission = (productPrice, commissionType, commissionValue) => {
  if (commissionType === 'percentage') {
    return (productPrice * commissionValue) / 100;
  } else {
    return commissionValue;
  }
};

/**
 * Get sales context for the user
 */
const getSalesContext = async (userId, companyId) => {
  try {
    // Get user info
    const user = await User.findUserById(userId);
    if (!user) throw new Error('User not found');

    // Get company products
    const products = await Product.getProductsByCompanyId(companyId);

    // Build context object
    return {
      userId,
      companyId,
      name: user.name,
      userName: user.name,
      role: user.role,
      userRole: user.role,
      products: products || [],
      company_name: user.company_name || 'Company',
      companyName: user.company_name || 'Company'
    };
  } catch (error) {
    logger.error('Failed to get sales context', { userId, companyId, error: error.message });
    return { userId, companyId, products: [] };
  }
};

/**
 * Build a safe local fallback response when OpenAI is unavailable
 */
const getFallbackResponse = (userMessage, context = {}) => {
  const normalizedMessage = String(userMessage || '').toLowerCase();
  const products = context.products || [];

  if (normalizedMessage.includes('commission')) {
    if (!products.length) {
      return 'I can help with commission calculations, but no products are configured yet. Please ask your admin to add products with commission settings.';
    }

    const preview = products
      .slice(0, 5)
      .map((p) => {
        const commission = p.commission_type === 'fixed'
          ? `$${p.commission_value} fixed`
          : `${p.commission_value}% of sale value`;
        return `- ${p.name}: ${commission}`;
      })
      .join('\n');

    return `I am currently running in fallback mode, but I can still help:\n\nHere are your product commission rules:\n${preview}\n\nIf you share a product name and sale amount, I can calculate commission manually.`;
  }

  if (normalizedMessage.includes('product') || normalizedMessage.includes('price')) {
    if (!products.length) {
      return 'No products are currently available for your company. Please ask your admin to create products first.';
    }

    const productList = products
      .slice(0, 10)
      .map((p) => `- ${p.name}: $${p.price}`)
      .join('\n');

    return `Here are the available products and prices:\n${productList}`;
  }

  return 'I am temporarily unable to reach the AI service, but I can still help with product details and commission-related questions. Try asking about "product prices" or "commission for a product".';
};

/**
 * Send message to OpenAI and get response
 */
const chat = async (userMessage, conversationHistory, context) => {
  try {
    const openaiClient = getOpenAIClient();
    if (!openaiClient) {
      return {
        message: getFallbackResponse(userMessage, context),
        tokensUsed: 0,
        model: 'fallback-local',
        metadata: {
          finishReason: 'fallback_no_api_key',
          promptTokens: 0,
          completionTokens: 0
        }
      };
    }

    const systemPrompt = buildSystemPrompt(context, context.products || []);

    // Format messages for API
    const messages = [
      ...conversationHistory.map(msg => ({
        role: msg.role,
        content: msg.content
      })),
      {
        role: 'user',
        content: userMessage
      }
    ];

    logger.debug('Sending message to OpenAI', { messageCount: messages.length });

    // Call OpenAI API
    const response = await openaiClient.chat.completions.create({
      model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: systemPrompt
        },
        ...messages
      ],
      max_tokens: parseInt(process.env.OPENAI_MAX_TOKENS || '500'),
      temperature: parseFloat(process.env.OPENAI_TEMPERATURE || '0.7'),
      top_p: 0.9
    });

    const assistantMessage = response.choices[0].message.content;
    const tokensUsed = response.usage.total_tokens;

    logger.info('OpenAI response received', {
      tokensUsed,
      model: response.model,
      finishReason: response.choices[0].finish_reason
    });

    return {
      message: assistantMessage,
      tokensUsed,
      model: response.model,
      metadata: {
        finishReason: response.choices[0].finish_reason,
        promptTokens: response.usage.prompt_tokens,
        completionTokens: response.usage.completion_tokens
      }
    };
  } catch (error) {
    logger.error('OpenAI API error', { error: error.message, status: error.status });

    // Fallback response if API fails
    return {
      message: getFallbackResponse(userMessage, context),
      tokensUsed: 0,
      model: 'fallback-local',
      metadata: {
        finishReason: 'fallback_openai_error',
        promptTokens: 0,
        completionTokens: 0
      }
    };
  }
};

/**
 * Generate conversation title from initial message
 */
const generateConversationTitle = (initialMessage) => {
  // Truncate and create title from first message
  const maxLength = 50;
  if (initialMessage.length <= maxLength) {
    return initialMessage;
  }
  return initialMessage.substring(0, maxLength - 3) + '...';
};

module.exports = {
  chat,
  getSalesContext,
  calculateCommission,
  generateConversationTitle,
  buildSystemPrompt
};
