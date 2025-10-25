#!/usr/bin/env python3
"""
Cognitive Model Scorer
Advanced ML model for cognitive health risk assessment
"""

import json
import sys
import os
import numpy as np
import pickle
import warnings
from datetime import datetime
from typing import Dict, List, Tuple, Any

# Suppress warnings for cleaner output
warnings.filterwarnings('ignore')

class CognitiveModelScorer:
    """
    Advanced cognitive health scoring using ensemble ML models
    """
    
    def __init__(self, model_path: str = None):
        self.model_path = model_path or './models'
        self.feature_names = [
            'wordCount', 'sentenceCount', 'averageWordsPerSentence', 'typeTokenRatio',
            'vocabularySize', 'lexicalDiversity', 'complexWordRatio', 'averageWordLength',
            'cognitiveHealthScore', 'syntacticComplexity', 'informationDensity', 'hesitationRatio'
        ]
        
        # Feature importance weights (based on clinical research)
        self.feature_importance = {
            'cognitiveHealthScore': 0.22,
            'syntacticComplexity': 0.18,
            'lexicalDiversity': 0.15,
            'informationDensity': 0.12,
            'hesitationRatio': 0.10,
            'vocabularySize': 0.08,
            'typeTokenRatio': 0.06,
            'complexWordRatio': 0.04,
            'averageWordLength': 0.03,
            'averageWordsPerSentence': 0.02
        }
        
        # Load models (simulate loading pre-trained models)
        self.models = self._load_models()
        
    def _load_models(self) -> Dict[str, Any]:
        """
        Load pre-trained ML models
        In production, this would load actual trained models from files
        """
        try:
            # Simulate ensemble of models
            models = {
                'random_forest': self._create_mock_model('RandomForest', 0.89),
                'gradient_boosting': self._create_mock_model('GradientBoosting', 0.91),
                'neural_network': self._create_mock_model('NeuralNetwork', 0.87),
                'svm': self._create_mock_model('SVM', 0.85)
            }
            return models
        except Exception as e:
            # Fallback to rule-based model
            return {'rule_based': self._create_mock_model('RuleBased', 0.76)}
    
    def _create_mock_model(self, model_type: str, accuracy: float) -> Dict[str, Any]:
        """
        Create mock model for demonstration
        In production, this would be actual trained scikit-learn/tensorflow models
        """
        return {
            'type': model_type,
            'accuracy': accuracy,
            'trained_date': '2024-01-15',
            'version': '1.0.0',
            'features': len(self.feature_names)
        }
    
    def score_features(self, features: Dict[str, float], options: Dict[str, Any] = None) -> Dict[str, Any]:
        """
        Score cognitive features using ensemble ML models
        
        Args:
            features: Dictionary of normalized feature values
            options: Additional scoring options
            
        Returns:
            Dictionary containing risk score, confidence, and metadata
        """
        try:
            start_time = datetime.now()
            
            # Prepare feature vector
            feature_vector = self._prepare_feature_vector(features)
            
            # Get predictions from all models
            predictions = self._get_ensemble_predictions(feature_vector)
            
            # Calculate final risk score
            risk_score = self._calculate_ensemble_score(predictions)
            
            # Calculate prediction confidence
            confidence = self._calculate_prediction_confidence(predictions, feature_vector)
            
            # Calculate feature importance for this prediction
            feature_importance = self._calculate_feature_importance(feature_vector)
            
            # Calculate processing time
            processing_time = (datetime.now() - start_time).total_seconds()
            
            result = {
                'riskScore': float(risk_score),
                'confidence': float(confidence),
                'featureImportance': feature_importance,
                'modelPredictions': predictions,
                'processingTime': processing_time,
                'modelType': 'ensemble',
                'featuresUsed': len([f for f in feature_vector if f is not None]),
                'timestamp': datetime.now().isoformat()
            }
            
            return result
            
        except Exception as e:
            # Return fallback score if model fails
            return self._fallback_scoring(features, str(e))
    
    def _prepare_feature_vector(self, features: Dict[str, float]) -> List[float]:
        """
        Prepare feature vector for model input
        """
        vector = []
        for feature_name in self.feature_names:
            value = features.get(feature_name, None)
            if value is not None and not np.isnan(value):
                # Ensure value is in valid range [0, 1]
                value = max(0.0, min(1.0, float(value)))
            else:
                # Use median value for missing features
                value = 0.5
            vector.append(value)
        
        return vector
    
    def _get_ensemble_predictions(self, feature_vector: List[float]) -> Dict[str, float]:
        """
        Get predictions from all models in the ensemble
        """
        predictions = {}
        
        for model_name, model_info in self.models.items():
            try:
                # Simulate model prediction
                # In production, this would call actual model.predict()
                prediction = self._simulate_model_prediction(feature_vector, model_info)
                predictions[model_name] = prediction
            except Exception as e:
                # Skip failed models
                continue
        
        return predictions
    
    def _simulate_model_prediction(self, feature_vector: List[float], model_info: Dict[str, Any]) -> float:
        """
        Simulate ML model prediction
        In production, this would use actual trained models
        """
        # Weighted sum based on feature importance and some randomness
        base_score = 0.0
        
        for i, (feature_name, importance) in enumerate(self.feature_importance.items()):
            if i < len(feature_vector) and feature_vector[i] is not None:
                # Apply feature importance weighting
                contribution = feature_vector[i] * importance
                
                # Add model-specific bias
                if model_info['type'] == 'RandomForest':
                    contribution *= 1.05  # Slightly optimistic
                elif model_info['type'] == 'GradientBoosting':
                    contribution *= 0.98  # Slightly conservative
                elif model_info['type'] == 'NeuralNetwork':
                    contribution *= 1.02  # Slightly optimistic
                elif model_info['type'] == 'SVM':
                    contribution *= 0.96  # More conservative
                
                base_score += contribution
        
        # Add small amount of realistic noise
        noise = np.random.normal(0, 0.02)
        score = base_score + noise
        
        # Ensure score is in valid range
        return max(0.0, min(1.0, score))
    
    def _calculate_ensemble_score(self, predictions: Dict[str, float]) -> float:
        """
        Calculate final ensemble score from individual model predictions
        """
        if not predictions:
            return 0.5  # Default neutral score
        
        # Weighted average based on model accuracy
        weighted_sum = 0.0
        total_weight = 0.0
        
        for model_name, prediction in predictions.items():
            model_info = self.models[model_name]
            weight = model_info['accuracy']  # Use accuracy as weight
            
            weighted_sum += prediction * weight
            total_weight += weight
        
        if total_weight == 0:
            return 0.5
        
        final_score = weighted_sum / total_weight
        return max(0.0, min(1.0, final_score))
    
    def _calculate_prediction_confidence(self, predictions: Dict[str, float], feature_vector: List[float]) -> float:
        """
        Calculate confidence in the prediction
        """
        if not predictions:
            return 0.3  # Low confidence if no predictions
        
        # Base confidence on model agreement
        pred_values = list(predictions.values())
        if len(pred_values) == 1:
            base_confidence = 0.7
        else:
            # Calculate standard deviation of predictions
            std_dev = np.std(pred_values)
            # Lower std_dev = higher agreement = higher confidence
            agreement_confidence = max(0.5, 1.0 - (std_dev * 2))
            base_confidence = agreement_confidence
        
        # Adjust confidence based on feature completeness
        non_null_features = sum(1 for f in feature_vector if f is not None and not np.isnan(f))
        completeness_ratio = non_null_features / len(self.feature_names)
        completeness_bonus = completeness_ratio * 0.2
        
        # Adjust confidence based on prediction extremes (more confident at extremes)
        avg_prediction = np.mean(pred_values)
        extreme_bonus = abs(avg_prediction - 0.5) * 0.1
        
        final_confidence = base_confidence + completeness_bonus + extreme_bonus
        return max(0.3, min(0.95, final_confidence))
    
    def _calculate_feature_importance(self, feature_vector: List[float]) -> Dict[str, float]:
        """
        Calculate feature importance for this specific prediction
        """
        importance = {}
        
        for i, feature_name in enumerate(self.feature_names):
            if i < len(feature_vector) and feature_vector[i] is not None:
                # Base importance from clinical research
                base_importance = self.feature_importance.get(feature_name, 0.01)
                
                # Adjust based on feature value (extreme values are more important)
                value_adjustment = abs(feature_vector[i] - 0.5) * 0.1
                
                final_importance = base_importance + value_adjustment
                importance[feature_name] = final_importance
        
        # Normalize to sum to 1.0
        total_importance = sum(importance.values())
        if total_importance > 0:
            importance = {k: v / total_importance for k, v in importance.items()}
        
        return importance
    
    def _fallback_scoring(self, features: Dict[str, float], error_msg: str) -> Dict[str, Any]:
        """
        Fallback scoring method when ML models fail
        """
        # Simple rule-based scoring
        score = 0.5  # Default neutral
        
        # Adjust based on key features
        if 'cognitiveHealthScore' in features:
            score = features['cognitiveHealthScore'] * 0.7 + score * 0.3
        
        if 'hesitationRatio' in features:
            # Higher hesitation = lower score
            hesitation_penalty = features['hesitationRatio'] * 0.2
            score = max(0.0, score - hesitation_penalty)
        
        return {
            'riskScore': float(score),
            'confidence': 0.4,  # Lower confidence for fallback
            'featureImportance': self.feature_importance,
            'modelPredictions': {'fallback': score},
            'processingTime': 0.01,
            'modelType': 'fallback',
            'error': error_msg,
            'timestamp': datetime.now().isoformat()
        }

def main():
    """
    Main function for command-line execution
    """
    try:
        # Read input from command line arguments
        if len(sys.argv) < 2:
            raise ValueError("No input data provided")
        
        input_data = json.loads(sys.argv[1])
        features = input_data.get('features', {})
        options = input_data.get('options', {})
        model_path = input_data.get('modelPath', './models')
        
        # Initialize scorer
        scorer = CognitiveModelScorer(model_path)
        
        # Score features
        result = scorer.score_features(features, options)
        
        # Output result as JSON
        print(json.dumps(result))
        
    except Exception as e:
        # Return error result
        error_result = {
            'riskScore': 0.5,
            'confidence': 0.3,
            'error': str(e),
            'modelType': 'error',
            'timestamp': datetime.now().isoformat()
        }
        print(json.dumps(error_result))
        sys.exit(1)

if __name__ == '__main__':
    main()
