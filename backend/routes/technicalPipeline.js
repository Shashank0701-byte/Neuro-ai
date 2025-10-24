const express = require('express');
const fs = require('fs').promises;
const path = require('path');
const { verifyToken, requireAdmin, requirePermission } = require('../middleware/auth');
const { validateBody } = require('../middleware/validation');
const { technicalPipelineSchema, moduleSchema } = require('../middleware/validation');
const { asyncHandler } = require('../middleware/errorHandler');

const router = express.Router();

// Path to data file
const DATA_FILE = path.join(__dirname, '../data/technicalPipelineData.json');

// Helper function to read data
const readData = async () => {
  try {
    const data = await fs.readFile(DATA_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading technical pipeline data file:', error);
    throw new Error('Failed to read technical pipeline data');
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
    console.error('Error writing technical pipeline data file:', error);
    throw new Error('Failed to save technical pipeline data');
  }
};

/**
 * @route   GET /api/technical-pipeline
 * @desc    Get complete technical pipeline with all modules
 * @access  Public
 */
router.get('/', 
  asyncHandler(async (req, res) => {
    const data = await readData();
    
    res.status(200).json({
      success: true,
      data: {
        overview: data.overview,
        modules: data.modules,
        dataFlow: data.dataFlow,
        performance: data.performance
      },
      metadata: data.metadata
    });
  })
);

/**
 * @route   GET /api/technical-pipeline/overview
 * @desc    Get pipeline overview
 * @access  Public
 */
router.get('/overview', 
  asyncHandler(async (req, res) => {
    const data = await readData();
    
    res.status(200).json({
      success: true,
      data: data.overview
    });
  })
);

/**
 * @route   GET /api/technical-pipeline/modules
 * @desc    Get all pipeline modules
 * @access  Public
 */
router.get('/modules', 
  asyncHandler(async (req, res) => {
    const data = await readData();
    
    res.status(200).json({
      success: true,
      data: data.modules,
      count: data.modules.length,
      metadata: data.metadata
    });
  })
);

/**
 * @route   GET /api/technical-pipeline/modules/:id
 * @desc    Get specific module by ID
 * @access  Public
 */
router.get('/modules/:id', 
  asyncHandler(async (req, res) => {
    const moduleId = req.params.id;
    const data = await readData();
    
    const module = data.modules.find(m => m.id === moduleId);
    
    if (!module) {
      return res.status(404).json({
        success: false,
        error: 'Module not found',
        message: `Module with ID ${moduleId} does not exist`
      });
    }
    
    res.status(200).json({
      success: true,
      data: module
    });
  })
);

/**
 * @route   GET /api/technical-pipeline/modules/category/:category
 * @desc    Get modules by category
 * @access  Public
 */
router.get('/modules/category/:category', 
  asyncHandler(async (req, res) => {
    const category = req.params.category;
    const data = await readData();
    
    const modules = data.modules.filter(m => 
      m.category.toLowerCase() === category.toLowerCase()
    );
    
    if (modules.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'No modules found',
        message: `No modules found in category: ${category}`
      });
    }
    
    res.status(200).json({
      success: true,
      data: modules,
      count: modules.length,
      category
    });
  })
);

/**
 * @route   GET /api/technical-pipeline/data-flow
 * @desc    Get data flow information
 * @access  Public
 */
router.get('/data-flow', 
  asyncHandler(async (req, res) => {
    const data = await readData();
    
    res.status(200).json({
      success: true,
      data: data.dataFlow
    });
  })
);

/**
 * @route   GET /api/technical-pipeline/performance
 * @desc    Get performance metrics
 * @access  Public
 */
router.get('/performance', 
  asyncHandler(async (req, res) => {
    const data = await readData();
    
    res.status(200).json({
      success: true,
      data: data.performance
    });
  })
);

/**
 * @route   GET /api/technical-pipeline/categories
 * @desc    Get list of all module categories
 * @access  Public
 */
router.get('/categories', 
  asyncHandler(async (req, res) => {
    const data = await readData();
    
    const categories = [...new Set(data.modules.map(m => m.category))];
    const categoryCounts = categories.map(cat => ({
      category: cat,
      count: data.modules.filter(m => m.category === cat).length,
      modules: data.modules
        .filter(m => m.category === cat)
        .map(m => ({ id: m.id, name: m.name }))
    }));
    
    res.status(200).json({
      success: true,
      data: categoryCounts,
      totalCategories: categories.length
    });
  })
);

/**
 * @route   PUT /api/technical-pipeline
 * @desc    Update entire technical pipeline
 * @access  Private (Admin with manage_content permission)
 */
router.put('/', 
  verifyToken,
  requireAdmin,
  requirePermission('manage_content'),
  validateBody(technicalPipelineSchema),
  asyncHandler(async (req, res) => {
    const currentData = await readData();
    
    const newData = {
      ...currentData,
      overview: req.body.overview,
      modules: req.body.modules,
      dataFlow: req.body.dataFlow,
      performance: req.body.performance
    };
    
    const updatedData = await writeData(newData, req.user.username);
    
    res.status(200).json({
      success: true,
      message: 'Technical pipeline updated successfully',
      data: {
        overview: updatedData.overview,
        modules: updatedData.modules,
        dataFlow: updatedData.dataFlow,
        performance: updatedData.performance
      },
      metadata: updatedData.metadata
    });
  })
);

/**
 * @route   PUT /api/technical-pipeline/modules/:id
 * @desc    Update specific module
 * @access  Private (Admin with manage_content permission)
 */
router.put('/modules/:id', 
  verifyToken,
  requireAdmin,
  requirePermission('manage_content'),
  validateBody(moduleSchema),
  asyncHandler(async (req, res) => {
    const moduleId = req.params.id;
    const data = await readData();
    
    const moduleIndex = data.modules.findIndex(m => m.id === moduleId);
    
    if (moduleIndex === -1) {
      return res.status(404).json({
        success: false,
        error: 'Module not found',
        message: `Module with ID ${moduleId} does not exist`
      });
    }
    
    // Ensure the ID in the body matches the URL parameter
    req.body.id = moduleId;
    
    data.modules[moduleIndex] = req.body;
    const updatedData = await writeData(data, req.user.username);
    
    res.status(200).json({
      success: true,
      message: `Module ${moduleId} updated successfully`,
      data: updatedData.modules[moduleIndex],
      metadata: updatedData.metadata
    });
  })
);

/**
 * @route   POST /api/technical-pipeline/modules
 * @desc    Add new module
 * @access  Private (Admin with manage_content permission)
 */
router.post('/modules', 
  verifyToken,
  requireAdmin,
  requirePermission('manage_content'),
  validateBody(moduleSchema),
  asyncHandler(async (req, res) => {
    const data = await readData();
    
    // Check if module ID already exists
    const existingModule = data.modules.find(m => m.id === req.body.id);
    if (existingModule) {
      return res.status(400).json({
        success: false,
        error: 'Module ID already exists',
        message: `Module with ID ${req.body.id} already exists`
      });
    }
    
    data.modules.push(req.body);
    
    const updatedData = await writeData(data, req.user.username);
    
    res.status(201).json({
      success: true,
      message: 'New module added successfully',
      data: req.body,
      metadata: updatedData.metadata
    });
  })
);

/**
 * @route   DELETE /api/technical-pipeline/modules/:id
 * @desc    Delete specific module
 * @access  Private (Admin with manage_content permission)
 */
router.delete('/modules/:id', 
  verifyToken,
  requireAdmin,
  requirePermission('manage_content'),
  asyncHandler(async (req, res) => {
    const moduleId = req.params.id;
    const data = await readData();
    
    const moduleIndex = data.modules.findIndex(m => m.id === moduleId);
    
    if (moduleIndex === -1) {
      return res.status(404).json({
        success: false,
        error: 'Module not found',
        message: `Module with ID ${moduleId} does not exist`
      });
    }
    
    const deletedModule = data.modules.splice(moduleIndex, 1)[0];
    const updatedData = await writeData(data, req.user.username);
    
    res.status(200).json({
      success: true,
      message: `Module ${moduleId} deleted successfully`,
      deletedModule,
      metadata: updatedData.metadata
    });
  })
);

/**
 * @route   GET /api/technical-pipeline/metadata
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
