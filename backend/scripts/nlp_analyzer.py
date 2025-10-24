#!/usr/bin/env python3
"""
Advanced NLP Feature Extraction Script for NeuroAid
Extracts comprehensive linguistic features for cognitive health analysis
"""

import sys
import json
import re
import math
from collections import Counter, defaultdict
from typing import Dict, List, Any, Tuple

try:
    import spacy
    import nltk
    from nltk.corpus import stopwords
    from nltk.tokenize import sent_tokenize, word_tokenize
    from nltk.tag import pos_tag
    from nltk.chunk import ne_chunk
    from nltk.tree import Tree
    from nltk.sentiment import SentimentIntensityAnalyzer
    from textstat import flesch_reading_ease, flesch_kincaid_grade, automated_readability_index
    from textstat import coleman_liau_index, gunning_fog, smog_index, linsear_write_formula
except ImportError as e:
    print(json.dumps({"error": f"Missing required package: {e}"}))
    sys.exit(1)

class NLPFeatureExtractor:
    """Comprehensive NLP feature extraction for cognitive health analysis"""
    
    def __init__(self, spacy_model: str = "en_core_web_sm"):
        """Initialize the NLP analyzer with required models"""
        try:
            # Load spaCy model
            self.nlp = spacy.load(spacy_model)
            
            # Download required NLTK data
            nltk_downloads = [
                'punkt', 'averaged_perceptron_tagger', 'stopwords',
                'vader_lexicon', 'maxent_ne_chunker', 'words'
            ]
            
            for dataset in nltk_downloads:
                try:
                    nltk.data.find(f'tokenizers/{dataset}')
                except LookupError:
                    nltk.download(dataset, quiet=True)
            
            # Initialize components
            self.stop_words = set(stopwords.words('english'))
            self.sia = SentimentIntensityAnalyzer()
            
        except Exception as e:
            print(json.dumps({"error": f"Failed to initialize NLP models: {e}"}))
            sys.exit(1)
    
    def extract_features(self, text: str, metadata: Dict = None) -> Dict[str, Any]:
        """Extract comprehensive NLP features from text"""
        try:
            if not text or not text.strip():
                return {"error": "Empty or invalid text provided"}
            
            # Clean and preprocess text
            cleaned_text = self._clean_text(text)
            
            # Process with spaCy
            doc = self.nlp(cleaned_text)
            
            # Extract all feature categories
            features = {
                "basic_stats": self._extract_basic_stats(text, doc),
                "lexical_features": self._extract_lexical_features(text, doc),
                "syntactic_features": self._extract_syntactic_features(doc),
                "semantic_features": self._extract_semantic_features(doc),
                "discourse_features": self._extract_discourse_features(text, doc),
                "readability_features": self._extract_readability_features(text),
                "cognitive_indicators": self._extract_cognitive_indicators(text, doc),
                "speech_patterns": self._extract_speech_patterns(text, doc, metadata),
                "sentiment_analysis": self._extract_sentiment_features(text),
                "named_entities": self._extract_named_entities(doc),
                "temporal_features": self._extract_temporal_features(doc),
                "complexity_metrics": self._extract_complexity_metrics(text, doc)
            }
            
            # Add metadata
            features["metadata"] = {
                "text_length": len(text),
                "processed_length": len(cleaned_text),
                "processing_timestamp": metadata.get("timestamp") if metadata else None,
                "spacy_model": self.nlp.meta["name"],
                "language": doc.lang_
            }
            
            return features
            
        except Exception as e:
            return {"error": f"Feature extraction failed: {str(e)}"}
    
    def _clean_text(self, text: str) -> str:
        """Clean and normalize text for processing"""
        # Remove excessive whitespace
        text = re.sub(r'\s+', ' ', text)
        # Remove special characters but keep punctuation
        text = re.sub(r'[^\w\s\.,!?;:\'"()-]', '', text)
        return text.strip()
    
    def _extract_basic_stats(self, text: str, doc) -> Dict[str, Any]:
        """Extract basic text statistics"""
        sentences = list(doc.sents)
        tokens = [token for token in doc if not token.is_space]
        words = [token for token in doc if token.is_alpha]
        
        return {
            "character_count": len(text),
            "word_count": len(words),
            "sentence_count": len(sentences),
            "token_count": len(tokens),
            "avg_word_length": sum(len(token.text) for token in words) / len(words) if words else 0,
            "avg_sentence_length": len(words) / len(sentences) if sentences else 0,
            "type_token_ratio": len(set(token.lemma_.lower() for token in words)) / len(words) if words else 0
        }
    
    def _extract_lexical_features(self, text: str, doc) -> Dict[str, Any]:
        """Extract lexical diversity and vocabulary features"""
        words = [token.lemma_.lower() for token in doc if token.is_alpha and not token.is_stop]
        all_words = [token.lemma_.lower() for token in doc if token.is_alpha]
        
        word_freq = Counter(words)
        pos_tags = [token.pos_ for token in doc if token.is_alpha]
        pos_freq = Counter(pos_tags)
        
        # Lexical diversity measures
        unique_words = len(set(words))
        total_words = len(words)
        
        return {
            "vocabulary_size": unique_words,
            "lexical_diversity": unique_words / total_words if total_words > 0 else 0,
            "hapax_legomena": sum(1 for count in word_freq.values() if count == 1),
            "hapax_ratio": sum(1 for count in word_freq.values() if count == 1) / total_words if total_words > 0 else 0,
            "content_word_ratio": len(words) / len(all_words) if all_words else 0,
            "function_word_ratio": (len(all_words) - len(words)) / len(all_words) if all_words else 0,
            "pos_distribution": dict(pos_freq),
            "most_frequent_words": dict(word_freq.most_common(10)),
            "word_length_distribution": self._get_word_length_distribution(doc)
        }
    
    def _extract_syntactic_features(self, doc) -> Dict[str, Any]:
        """Extract syntactic complexity features"""
        sentences = list(doc.sents)
        
        # Dependency parsing features
        dep_labels = [token.dep_ for token in doc]
        dep_freq = Counter(dep_labels)
        
        # Tree depth and complexity
        tree_depths = []
        clause_counts = []
        
        for sent in sentences:
            depth = self._calculate_tree_depth(sent.root)
            tree_depths.append(depth)
            
            # Count clauses (simplified)
            clause_count = sum(1 for token in sent if token.dep_ in ['ccomp', 'xcomp', 'advcl', 'acl', 'relcl'])
            clause_counts.append(clause_count)
        
        return {
            "avg_tree_depth": sum(tree_depths) / len(tree_depths) if tree_depths else 0,
            "max_tree_depth": max(tree_depths) if tree_depths else 0,
            "avg_clauses_per_sentence": sum(clause_counts) / len(clause_counts) if clause_counts else 0,
            "dependency_distribution": dict(dep_freq),
            "subordination_ratio": dep_freq.get('mark', 0) / len(sentences) if sentences else 0,
            "coordination_ratio": dep_freq.get('cc', 0) / len(sentences) if sentences else 0,
            "passive_voice_ratio": self._calculate_passive_ratio(doc)
        }
    
    def _extract_semantic_features(self, doc) -> Dict[str, Any]:
        """Extract semantic and meaning-related features"""
        # Semantic similarity and coherence measures would go here
        # For now, we'll extract basic semantic features
        
        entities = [ent.label_ for ent in doc.ents]
        entity_freq = Counter(entities)
        
        return {
            "entity_count": len(doc.ents),
            "entity_types": dict(entity_freq),
            "entity_density": len(doc.ents) / len([token for token in doc if token.is_alpha]) if doc else 0,
            "semantic_roles": self._extract_semantic_roles(doc)
        }
    
    def _extract_discourse_features(self, text: str, doc) -> Dict[str, Any]:
        """Extract discourse and coherence features"""
        sentences = list(doc.sents)
        
        # Discourse markers
        discourse_markers = [
            'however', 'therefore', 'moreover', 'furthermore', 'nevertheless',
            'consequently', 'meanwhile', 'additionally', 'similarly', 'conversely'
        ]
        
        marker_count = sum(1 for token in doc if token.lemma_.lower() in discourse_markers)
        
        # Pronoun usage (cohesion indicator)
        pronouns = [token for token in doc if token.pos_ == 'PRON']
        
        return {
            "discourse_marker_count": marker_count,
            "discourse_marker_ratio": marker_count / len(sentences) if sentences else 0,
            "pronoun_count": len(pronouns),
            "pronoun_ratio": len(pronouns) / len([token for token in doc if token.is_alpha]) if doc else 0,
            "sentence_connectivity": self._calculate_sentence_connectivity(sentences)
        }
    
    def _extract_readability_features(self, text: str) -> Dict[str, Any]:
        """Extract readability and complexity scores"""
        try:
            return {
                "flesch_reading_ease": flesch_reading_ease(text),
                "flesch_kincaid_grade": flesch_kincaid_grade(text),
                "automated_readability_index": automated_readability_index(text),
                "coleman_liau_index": coleman_liau_index(text),
                "gunning_fog": gunning_fog(text),
                "smog_index": smog_index(text),
                "linsear_write": linsear_write_formula(text)
            }
        except:
            return {"error": "Could not calculate readability scores"}
    
    def _extract_cognitive_indicators(self, text: str, doc) -> Dict[str, Any]:
        """Extract features indicative of cognitive health"""
        words = [token for token in doc if token.is_alpha]
        
        # Hesitation markers
        hesitation_markers = ['um', 'uh', 'er', 'ah', 'hmm', 'well', 'you know', 'like']
        hesitation_count = sum(1 for token in doc if token.text.lower() in hesitation_markers)
        
        # Repetition detection
        word_sequence = [token.lemma_.lower() for token in words]
        repetitions = self._detect_repetitions(word_sequence)
        
        # Semantic fluency indicators
        semantic_categories = self._categorize_semantic_content(doc)
        
        return {
            "hesitation_markers": hesitation_count,
            "hesitation_ratio": hesitation_count / len(words) if words else 0,
            "word_repetitions": repetitions,
            "semantic_fluency": semantic_categories,
            "information_density": self._calculate_information_density(doc),
            "cognitive_load_indicators": self._assess_cognitive_load(doc)
        }
    
    def _extract_speech_patterns(self, text: str, doc, metadata: Dict = None) -> Dict[str, Any]:
        """Extract speech-specific patterns and timing features"""
        features = {}
        
        if metadata and 'duration' in metadata:
            duration = metadata['duration']
            word_count = len([token for token in doc if token.is_alpha])
            
            features.update({
                "speech_rate": word_count / duration if duration > 0 else 0,
                "words_per_minute": (word_count / duration) * 60 if duration > 0 else 0,
                "pause_indicators": self._detect_pause_indicators(text),
                "articulation_complexity": self._assess_articulation_complexity(doc)
            })
        
        return features
    
    def _extract_sentiment_features(self, text: str) -> Dict[str, Any]:
        """Extract sentiment and emotional features"""
        scores = self.sia.polarity_scores(text)
        
        return {
            "sentiment_compound": scores['compound'],
            "sentiment_positive": scores['pos'],
            "sentiment_negative": scores['neg'],
            "sentiment_neutral": scores['neu'],
            "emotional_valence": self._classify_emotional_valence(scores['compound'])
        }
    
    def _extract_named_entities(self, doc) -> Dict[str, Any]:
        """Extract and categorize named entities"""
        entities = []
        for ent in doc.ents:
            entities.append({
                "text": ent.text,
                "label": ent.label_,
                "start": ent.start_char,
                "end": ent.end_char
            })
        
        entity_types = Counter([ent.label_ for ent in doc.ents])
        
        return {
            "entities": entities,
            "entity_type_counts": dict(entity_types),
            "person_mentions": entity_types.get('PERSON', 0),
            "location_mentions": entity_types.get('GPE', 0) + entity_types.get('LOC', 0),
            "organization_mentions": entity_types.get('ORG', 0)
        }
    
    def _extract_temporal_features(self, doc) -> Dict[str, Any]:
        """Extract temporal expressions and time-related features"""
        temporal_entities = [ent for ent in doc.ents if ent.label_ in ['DATE', 'TIME', 'EVENT']]
        
        return {
            "temporal_expressions": len(temporal_entities),
            "temporal_density": len(temporal_entities) / len(list(doc.sents)) if doc.sents else 0,
            "temporal_entities": [{"text": ent.text, "label": ent.label_} for ent in temporal_entities]
        }
    
    def _extract_complexity_metrics(self, text: str, doc) -> Dict[str, Any]:
        """Extract various complexity metrics"""
        sentences = list(doc.sents)
        words = [token for token in doc if token.is_alpha]
        
        # Syntactic complexity
        embedded_clauses = sum(1 for token in doc if token.dep_ in ['ccomp', 'xcomp', 'advcl'])
        
        # Lexical complexity
        complex_words = sum(1 for token in words if len(token.text) > 6)
        
        return {
            "syntactic_complexity": embedded_clauses / len(sentences) if sentences else 0,
            "lexical_complexity": complex_words / len(words) if words else 0,
            "overall_complexity_score": self._calculate_overall_complexity(doc),
            "cognitive_demand_score": self._calculate_cognitive_demand(doc)
        }
    
    # Helper methods
    def _calculate_tree_depth(self, token, depth=0):
        """Calculate the maximum depth of dependency tree"""
        if not list(token.children):
            return depth
        return max(self._calculate_tree_depth(child, depth + 1) for child in token.children)
    
    def _calculate_passive_ratio(self, doc):
        """Calculate ratio of passive voice constructions"""
        passive_count = 0
        total_verbs = 0
        
        for token in doc:
            if token.pos_ == 'VERB':
                total_verbs += 1
                if token.dep_ == 'auxpass' or (token.dep_ == 'nsubjpass'):
                    passive_count += 1
        
        return passive_count / total_verbs if total_verbs > 0 else 0
    
    def _extract_semantic_roles(self, doc):
        """Extract basic semantic role information"""
        roles = {'agent': 0, 'patient': 0, 'theme': 0}
        
        for token in doc:
            if token.dep_ == 'nsubj':
                roles['agent'] += 1
            elif token.dep_ == 'dobj':
                roles['patient'] += 1
            elif token.dep_ == 'pobj':
                roles['theme'] += 1
        
        return roles
    
    def _calculate_sentence_connectivity(self, sentences):
        """Calculate how well sentences are connected"""
        if len(sentences) < 2:
            return 0
        
        # Simple measure based on pronoun and determiner usage
        connectivity_score = 0
        for i in range(1, len(sentences)):
            sent = sentences[i]
            pronouns = sum(1 for token in sent if token.pos_ == 'PRON')
            determiners = sum(1 for token in sent if token.pos_ == 'DET')
            connectivity_score += (pronouns + determiners) / len(sent)
        
        return connectivity_score / (len(sentences) - 1)
    
    def _detect_repetitions(self, word_sequence):
        """Detect word and phrase repetitions"""
        repetitions = {'immediate': 0, 'near': 0}
        
        for i in range(len(word_sequence) - 1):
            if word_sequence[i] == word_sequence[i + 1]:
                repetitions['immediate'] += 1
            
            # Check for repetitions within 3 words
            for j in range(i + 2, min(i + 4, len(word_sequence))):
                if word_sequence[i] == word_sequence[j]:
                    repetitions['near'] += 1
        
        return repetitions
    
    def _categorize_semantic_content(self, doc):
        """Categorize content into semantic categories"""
        categories = defaultdict(int)
        
        for token in doc:
            if token.pos_ == 'NOUN':
                # Simple categorization based on word
                if token.lemma_ in ['person', 'people', 'man', 'woman', 'child']:
                    categories['people'] += 1
                elif token.lemma_ in ['house', 'home', 'building', 'room']:
                    categories['places'] += 1
                elif token.lemma_ in ['car', 'bike', 'plane', 'train']:
                    categories['transportation'] += 1
                else:
                    categories['other'] += 1
        
        return dict(categories)
    
    def _calculate_information_density(self, doc):
        """Calculate information density of the text"""
        content_words = sum(1 for token in doc if token.pos_ in ['NOUN', 'VERB', 'ADJ', 'ADV'])
        total_words = sum(1 for token in doc if token.is_alpha)
        
        return content_words / total_words if total_words > 0 else 0
    
    def _assess_cognitive_load(self, doc):
        """Assess indicators of cognitive load"""
        indicators = {
            'complex_sentences': 0,
            'nested_structures': 0,
            'abstract_concepts': 0
        }
        
        for sent in doc.sents:
            # Complex sentences (multiple clauses)
            clause_count = sum(1 for token in sent if token.dep_ in ['ccomp', 'xcomp', 'advcl'])
            if clause_count > 1:
                indicators['complex_sentences'] += 1
            
            # Nested structures
            max_depth = self._calculate_tree_depth(sent.root)
            if max_depth > 3:
                indicators['nested_structures'] += 1
            
            # Abstract concepts (simplified)
            abstract_words = sum(1 for token in sent if token.pos_ == 'NOUN' and len(token.text) > 8)
            indicators['abstract_concepts'] += abstract_words
        
        return indicators
    
    def _detect_pause_indicators(self, text):
        """Detect indicators of pauses in speech"""
        pause_markers = ['...', '--', ',', ';']
        pause_count = sum(text.count(marker) for marker in pause_markers)
        
        return {
            'total_pauses': pause_count,
            'ellipsis_count': text.count('...'),
            'comma_count': text.count(','),
            'dash_count': text.count('--')
        }
    
    def _assess_articulation_complexity(self, doc):
        """Assess complexity of articulation based on phonological features"""
        complex_sounds = 0
        total_words = 0
        
        for token in doc:
            if token.is_alpha:
                total_words += 1
                # Simple heuristic for articulation complexity
                if any(cluster in token.text.lower() for cluster in ['str', 'spr', 'thr', 'scr']):
                    complex_sounds += 1
        
        return complex_sounds / total_words if total_words > 0 else 0
    
    def _classify_emotional_valence(self, compound_score):
        """Classify emotional valence based on compound sentiment score"""
        if compound_score >= 0.05:
            return 'positive'
        elif compound_score <= -0.05:
            return 'negative'
        else:
            return 'neutral'
    
    def _calculate_overall_complexity(self, doc):
        """Calculate overall text complexity score"""
        # Combine multiple complexity measures
        syntactic = len([token for token in doc if token.dep_ in ['ccomp', 'xcomp', 'advcl']])
        lexical = len([token for token in doc if token.is_alpha and len(token.text) > 6])
        semantic = len(doc.ents)
        
        total_tokens = len([token for token in doc if token.is_alpha])
        
        if total_tokens == 0:
            return 0
        
        return (syntactic + lexical + semantic) / total_tokens
    
    def _calculate_cognitive_demand(self, doc):
        """Calculate cognitive demand score"""
        # Simplified cognitive demand calculation
        complex_structures = sum(1 for token in doc if token.dep_ in ['ccomp', 'xcomp', 'advcl', 'relcl'])
        abstract_words = sum(1 for token in doc if token.pos_ == 'NOUN' and len(token.text) > 7)
        
        total_sentences = len(list(doc.sents))
        
        return (complex_structures + abstract_words) / total_sentences if total_sentences > 0 else 0
    
    def _get_word_length_distribution(self, doc):
        """Get distribution of word lengths"""
        lengths = [len(token.text) for token in doc if token.is_alpha]
        length_counts = Counter(lengths)
        
        return {
            'mean_length': sum(lengths) / len(lengths) if lengths else 0,
            'distribution': dict(length_counts),
            'long_words_ratio': sum(1 for length in lengths if length > 6) / len(lengths) if lengths else 0
        }

def main():
    """Main function to process command line arguments and extract features"""
    if len(sys.argv) < 2:
        print(json.dumps({"error": "No text provided"}))
        sys.exit(1)
    
    try:
        # Parse input arguments
        input_data = json.loads(sys.argv[1])
        text = input_data.get('text', '')
        metadata = input_data.get('metadata', {})
        spacy_model = input_data.get('spacy_model', 'en_core_web_sm')
        
        # Initialize extractor
        extractor = NLPFeatureExtractor(spacy_model)
        
        # Extract features
        features = extractor.extract_features(text, metadata)
        
        # Output results
        print(json.dumps(features, indent=2))
        
    except json.JSONDecodeError:
        print(json.dumps({"error": "Invalid JSON input"}))
        sys.exit(1)
    except Exception as e:
        print(json.dumps({"error": f"Processing failed: {str(e)}"}))
        sys.exit(1)

if __name__ == "__main__":
    main()
