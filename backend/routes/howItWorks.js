const express = require('express');
const fs = require('fs').promises;
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const { verifyToken, requireAdmin, requirePermission } = require('../middleware/auth');
const { validateBody } = require('../middleware/validation');
const { howItWorksSchema, stepSchema } = require('../middleware/validation');
const { asyncHandler } = require('../middleware/errorHandler');

const router = express.Router();

// Path to data file
const DATA_FILE = path.join(__dirname, '../data/howItWorksData.json');

// Helper function to read data
const readData = async () => {
  try {
    const data = await fs.readFile(DATA_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading data file:', error);
    throw new Error('Failed to read data');
  }
};

// Helper function to write data
const writeData = async (data, updatedBy = 'system') => {
  try {
    const updatedData = {
      ...data,
      metadata: {
        ...data.metadata,
        lastUpdated: new Date().toISOString(),
        version: data.metadata.version || '1.0.0',
        updatedBy
      }
    };
    await fs.writeFile(DATA_FILE, JSON.stringify(updatedData, null, 2));
    return updatedData;
  } catch (error) {
    console.error('Error writing data file:', error);
    throw new Error('Failed to save data');
  }
};

/**
 * @route   GET /api/how-it-works
 * @desc    Get all How It Works content
 * @access  Public
 */
router.get('/', 
  asyncHandler(async (req, res) => {
    const data = await readData();
    
    res.status(200).json({
      success: true,
      data: {
        header: data.header,
        steps: data.steps,
        summary: data.summary,
        validation: data.validation
      },
      metadata: data.metadata
    });
  })
);

/**
 * @route   GET /api/how-it-works/steps
 * @desc    Get all steps
 * @access  Public
 */
router.get('/steps', 
  asyncHandler(async (req, res) => {
    const data = await readData();
    
    res.status(200).json({
      success: true,
      data: data.steps,
      count: data.steps.length,
      metadata: data.metadata
    });
  })
);

/**
 * @route   GET /api/how-it-works/steps/:id
 * @desc    Get specific step by ID
 * @access  Public
 */
router.get('/steps/:id', 
  asyncHandler(async (req, res) => {
    const stepId = parseInt(req.params.id);
    const data = await readData();
    
    const step = data.steps.find(s => s.id === stepId);
    
    if (!step) {
      return res.status(404).json({
        success: false,
        error: 'Step not found',
        message: `Step with ID ${stepId} does not exist`
      });
    }
    
    res.status(200).json({
      success: true,
      data: step
    });
  })
);

/**
 * @route   GET /api/how-it-works/header
 * @desc    Get header content
 * @access  Public
 */
router.get('/header', 
  asyncHandler(async (req, res) => {
    const data = await readData();
    
    res.status(200).json({
      success: true,
      data: data.header
    });
  })
);

/**
 * @route   GET /api/how-it-works/summary
 * @desc    Get summary content
 * @access  Public
 */
router.get('/summary', 
  asyncHandler(async (req, res) => {
    const data = await readData();
    
    res.status(200).json({
      success: true,
      data: data.summary
    });
  })
);

/**
 * @route   PUT /api/how-it-works
 * @desc    Update entire How It Works content
 * @access  Private (Admin with manage_content permission)
 */
router.put('/', 
  verifyToken,
  requireAdmin,
  requirePermission('manage_content'),
  validateBody(howItWorksSchema),
  asyncHandler(async (req, res) => {
    const currentData = await readData();
    
    const newData = {
      ...currentData,
      header: req.body.header,
      steps: req.body.steps,
      summary: req.body.summary,
      validation: req.body.validation
    };
    
    const updatedData = await writeData(newData, req.user.username);
    
    res.status(200).json({
      success: true,
      message: 'How It Works content updated successfully',
      data: {
        header: updatedData.header,
        steps: updatedData.steps,
        summary: updatedData.summary,
        validation: updatedData.validation
      },
      metadata: updatedData.metadata
    });
  })
);

/**
 * @route   PUT /api/how-it-works/header
 * @desc    Update header content
 * @access  Private (Admin with manage_content permission)
 */
router.put('/header', 
  verifyToken,
  requireAdmin,
  requirePermission('manage_content'),
  asyncHandler(async (req, res) => {
    const data = await readData();
    
    data.header = req.body;
    const updatedData = await writeData(data, req.user.username);
    
    res.status(200).json({
      success: true,
      message: 'Header updated successfully',
      data: updatedData.header,
      metadata: updatedData.metadata
    });
  })
);

/**
 * @route   PUT /api/how-it-works/steps/:id
 * @desc    Update specific step
 * @access  Private (Admin with manage_content permission)
 */
router.put('/steps/:id', 
  verifyToken,
  requireAdmin,
  requirePermission('manage_content'),
  validateBody(stepSchema),
  asyncHandler(async (req, res) => {
    const stepId = parseInt(req.params.id);
    const data = await readData();
    
    const stepIndex = data.steps.findIndex(s => s.id === stepId);
    
    if (stepIndex === -1) {
      return res.status(404).json({
        success: false,
        error: 'Step not found',
        message: `Step with ID ${stepId} does not exist`
      });
    }
    
    // Ensure the ID in the body matches the URL parameter
    req.body.id = stepId;
    
    data.steps[stepIndex] = req.body;
    const updatedData = await writeData(data, req.user.username);
    
    res.status(200).json({
      success: true,
      message: `Step ${stepId} updated successfully`,
      data: updatedData.steps[stepIndex],
      metadata: updatedData.metadata
    });
  })
);

/**
 * @route   POST /api/how-it-works/steps
 * @desc    Add new step
 * @access  Private (Admin with manage_content permission)
 */
router.post('/steps', 
  verifyToken,
  requireAdmin,
  requirePermission('manage_content'),
  validateBody(stepSchema),
  asyncHandler(async (req, res) => {
    const data = await readData();
    
    // Check if step ID already exists
    const existingStep = data.steps.find(s => s.id === req.body.id);
    if (existingStep) {
      return res.status(400).json({
        success: false,
        error: 'Step ID already exists',
        message: `Step with ID ${req.body.id} already exists`
      });
    }
    
    data.steps.push(req.body);
    data.steps.sort((a, b) => a.id - b.id); // Keep steps sorted by ID
    
    const updatedData = await writeData(data, req.user.username);
    
    res.status(201).json({
      success: true,
      message: 'New step added successfully',
      data: req.body,
      metadata: updatedData.metadata
    });
  })
);

/**
 * @route   DELETE /api/how-it-works/steps/:id
 * @desc    Delete specific step
 * @access  Private (Admin with manage_content permission)
 */
router.delete('/steps/:id', 
  verifyToken,
  requireAdmin,
  requirePermission('manage_content'),
  asyncHandler(async (req, res) => {
    const stepId = parseInt(req.params.id);
    const data = await readData();
    
    const stepIndex = data.steps.findIndex(s => s.id === stepId);
    
    if (stepIndex === -1) {
      return res.status(404).json({
        success: false,
        error: 'Step not found',
        message: `Step with ID ${stepId} does not exist`
      });
    }
    
    const deletedStep = data.steps.splice(stepIndex, 1)[0];
    const updatedData = await writeData(data, req.user.username);
    
    res.status(200).json({
      success: true,
      message: `Step ${stepId} deleted successfully`,
      deletedStep,
      metadata: updatedData.metadata
    });
  })
);

/**
 * @route   PUT /api/how-it-works/summary
 * @desc    Update summary content
 * @access  Private (Admin with manage_content permission)
 */
router.put('/summary', 
  verifyToken,
  requireAdmin,
  requirePermission('manage_content'),
  asyncHandler(async (req, res) => {
    const data = await readData();
    
    data.summary = req.body;
    const updatedData = await writeData(data, req.user.username);
    
    res.status(200).json({
      success: true,
      message: 'Summary updated successfully',
      data: updatedData.summary,
      metadata: updatedData.metadata
    });
  })
);

/**
 * @route   PUT /api/how-it-works/validation
 * @desc    Update validation content
 * @access  Private (Admin with manage_content permission)
 */
router.put('/validation', 
  verifyToken,
  requireAdmin,
  requirePermission('manage_content'),
  asyncHandler(async (req, res) => {
    const data = await readData();
    
    data.validation = req.body;
    const updatedData = await writeData(data, req.user.username);
    
    res.status(200).json({
      success: true,
      message: 'Validation content updated successfully',
      data: updatedData.validation,
      metadata: updatedData.metadata
    });
  })
);

/**
 * @route   GET /api/how-it-works/metadata
 * @desc    Get metadata information
 * @access  Private (Admin)
 */
router.get('/metadata', 
  verifyToken,
  requireAdmin,
  asyncHandler(async (req, res) => {
    const data = await readData();
    
    res.status(200).json({
      success: true,
      data: data.metadata
    });
  })
);

module.exports = router;
