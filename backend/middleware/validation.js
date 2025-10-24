const Joi = require('joi');

// Step validation schema
const stepSchema = Joi.object({
  id: Joi.number().integer().min(1).required(),
  icon: Joi.string().required(),
  title: Joi.string().min(1).max(100).required(),
  shortDesc: Joi.string().min(1).max(200).required(),
  duration: Joi.string().min(1).max(50).required(),
  color: Joi.string().pattern(/^from-\w+-\d+\s+to-\w+-\d+$/).required(),
  bgColor: Joi.string().pattern(/^bg-\w+-\d+$/).required(),
  borderColor: Joi.string().pattern(/^border-\w+-\d+$/).required(),
  details: Joi.object({
    overview: Joi.string().min(1).max(1000).required(),
    substeps: Joi.array().items(
      Joi.object({
        icon: Joi.string().required(),
        title: Joi.string().min(1).max(100).required(),
        description: Joi.string().min(1).max(500).required()
      })
    ).min(1).max(10).required(),
    technicalDetails: Joi.array().items(
      Joi.string().min(1).max(200)
    ).min(1).max(20).required()
  }).required()
});

// Header validation schema
const headerSchema = Joi.object({
  badge: Joi.object({
    text: Joi.string().min(1).max(50).required(),
    icon: Joi.string().required()
  }).required(),
  title: Joi.string().min(1).max(100).required(),
  subtitle: Joi.string().min(1).max(100).required(),
  description: Joi.string().min(1).max(500).required()
});

// Summary validation schema
const summarySchema = Joi.object({
  totalTime: Joi.string().min(1).max(50).required(),
  description: Joi.string().min(1).max(500).required()
});

// Validation section schema
const validationSectionSchema = Joi.object({
  title: Joi.string().min(1).max(100).required(),
  description: Joi.string().min(1).max(500).required(),
  points: Joi.array().items(
    Joi.string().min(1).max(200)
  ).min(1).max(10).required()
});

// Full How It Works data schema
const howItWorksSchema = Joi.object({
  header: headerSchema.required(),
  steps: Joi.array().items(stepSchema).min(1).max(10).required(),
  summary: summarySchema.required(),
  validation: Joi.object({
    scientific: validationSectionSchema.required(),
    privacy: validationSectionSchema.required()
  }).required()
});

// Admin login schema
const adminLoginSchema = Joi.object({
  username: Joi.string().min(3).max(50).required(),
  password: Joi.string().min(6).max(100).required()
});

// Technical Pipeline Module schema
const moduleSchema = Joi.object({
  id: Joi.string().min(1).max(50).required(),
  name: Joi.string().min(1).max(100).required(),
  category: Joi.string().valid('Input', 'Processing', 'Analysis', 'Prediction', 'Output', 'Infrastructure').required(),
  order: Joi.number().integer().min(1).required(),
  description: Joi.string().min(1).max(500).required(),
  icon: Joi.string().required(),
  color: Joi.string().pattern(/^from-\w+-\d+\s+to-\w+-\d+$/).required(),
  bgColor: Joi.string().pattern(/^bg-\w+-\d+$/).required(),
  borderColor: Joi.string().pattern(/^border-\w+-\d+$/).required(),
  processingTime: Joi.string().min(1).max(50).required(),
  technologies: Joi.array().items(Joi.string().min(1).max(200)).min(1).required(),
  inputs: Joi.array().items(Joi.object()).min(0).required(),
  outputs: Joi.array().items(Joi.object()).min(0).required(),
  performance: Joi.object().optional()
});

// Technical Pipeline overview schema
const pipelineOverviewSchema = Joi.object({
  title: Joi.string().min(1).max(100).required(),
  description: Joi.string().min(1).max(500).required(),
  totalModules: Joi.number().integer().min(1).required(),
  averageProcessingTime: Joi.string().min(1).max(50).required(),
  architecture: Joi.string().min(1).max(200).required(),
  scalability: Joi.string().min(1).max(200).required()
});

// Full Technical Pipeline schema
const technicalPipelineSchema = Joi.object({
  overview: pipelineOverviewSchema.required(),
  modules: Joi.array().items(moduleSchema).min(1).required(),
  dataFlow: Joi.object().required(),
  performance: Joi.object().required()
});

// Speech-to-Text transcription options schema
const transcriptionOptionsSchema = Joi.object({
  language: Joi.string().min(2).max(5).optional(),
  model: Joi.string().valid('tiny', 'base', 'small', 'medium', 'large', 'whisper-1').optional(),
  enhanceAudio: Joi.boolean().optional(),
  responseFormat: Joi.string().valid('json', 'text', 'srt', 'verbose_json', 'vtt').optional(),
  temperature: Joi.number().min(0).max(1).optional()
});

// Transcription query parameters schema
const transcriptionQuerySchema = Joi.object({
  page: Joi.number().integer().min(1).optional(),
  limit: Joi.number().integer().min(1).max(100).optional(),
  status: Joi.string().valid('completed', 'failed', 'processing').optional(),
  dateFrom: Joi.date().iso().optional(),
  dateTo: Joi.date().iso().optional()
});

// Validate request body
const validateBody = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body, { abortEarly: false });
    if (error) {
      error.isJoi = true;
      return next(error);
    }
    next();
  };
};

// Validate query parameters
const validateQuery = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.query, { abortEarly: false });
    if (error) {
      error.isJoi = true;
      return next(error);
    }
    next();
  };
};

module.exports = {
  stepSchema,
  headerSchema,
  summarySchema,
  validationSectionSchema,
  howItWorksSchema,
  adminLoginSchema,
  moduleSchema,
  pipelineOverviewSchema,
  technicalPipelineSchema,
  transcriptionOptionsSchema,
  transcriptionQuerySchema,
  validateBody,
  validateQuery
};
