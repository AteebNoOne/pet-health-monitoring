"""
Dog Emotion Detection Routes
Handles API endpoints for dog emotion prediction
"""

from flask import Blueprint, request, jsonify, current_app
import os
from werkzeug.utils import secure_filename

dog_emotion_bp = Blueprint('dog_emotion', __name__)

# Allowed image extensions
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif', 'bmp', 'webp'}


def allowed_file(filename):
    """Check if file extension is allowed"""
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS


@dog_emotion_bp.route('/detect', methods=['POST'])
def detect_dog_emotion():
    """
    Endpoint to detect dog emotion from uploaded image and save to history
    
    Expected: multipart/form-data with 'image' file and 'pet_id' field
    
    Returns:
        JSON response with emotion prediction and confidence
    """
    try:
        # Check if image file is in request
        if 'image' not in request.files:
            return jsonify({
                'success': False,
                'error': 'No image file provided'
            }), 400
        
        # Get pet_id from form data
        pet_id = request.form.get('pet_id')
        if not pet_id:
            return jsonify({
                'success': False,
                'error': 'pet_id is required'
            }), 400
        
        file = request.files['image']
        
        # Check if file is empty
        if file.filename == '':
            return jsonify({
                'success': False,
                'error': 'No file selected'
            }), 400
        
        # Check if file type is allowed
        if not allowed_file(file.filename):
            return jsonify({
                'success': False,
                'error': f'Invalid file type. Allowed types: {", ".join(ALLOWED_EXTENSIONS)}'
            }), 400
        
        # Read image bytes
        image_bytes = file.read()
        
        # Load the detector service
        from app.services.dog_emotion_service import get_dog_emotion_detector
        detector = get_dog_emotion_detector()
        
        # Make prediction
        result = detector.predict_from_bytes(image_bytes)
        
        if result['success']:
            # Save to database
            from app.models import DogEmotionHistory
            from app import db
            import json
            
            # Create history record
            history_record = DogEmotionHistory(
                pet_id=int(pet_id),
                emotion=result['emotion'],
                confidence=result['confidence'],
                probabilities=json.dumps(result['all_probabilities']),
                image_url=None  # Not saving image for now, but can be added
            )
            
            db.session.add(history_record)
            db.session.commit()
            
            return jsonify({
                'success': True,
                'data': {
                    'id': history_record.id,
                    'emotion': result['emotion'],
                    'confidence': result['confidence'],
                    'probabilities': result['all_probabilities'],
                    'created_at': history_record.created_at.isoformat()
                }
            }), 200
        else:
            return jsonify({
                'success': False,
                'error': result['error']
            }), 500
    
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


@dog_emotion_bp.route('/history/<int:pet_id>', methods=['GET'])
def get_emotion_history(pet_id):
    """
    Get emotion detection history for a specific pet
    
    Args:
        pet_id: ID of the pet
    
    Query params:
        limit: Number of records to return (default: 50)
        
    Returns:
        JSON response with list of emotion history records
    """
    try:
        from app.models import DogEmotionHistory
        
        # Get limit from query params (default 50)
        limit = request.args.get('limit', 50, type=int)
        
        # Query history for this pet, ordered by most recent first
        history = DogEmotionHistory.query.filter_by(pet_id=pet_id)\
            .order_by(DogEmotionHistory.created_at.desc())\
            .limit(limit)\
            .all()
        
        # Convert to dict
        history_data = [record.to_dict() for record in history]
        
        return jsonify({
            'success': True,
            'data': {
                'pet_id': pet_id,
                'total': len(history_data),
                'history': history_data
            }
        }), 200
    
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


@dog_emotion_bp.route('/health', methods=['GET'])
def health_check():
    """
    Health check endpoint to verify model is loaded
    """
    try:
        from app.services.dog_emotion_service import get_dog_emotion_detector
        detector = get_dog_emotion_detector()
        
        return jsonify({
            'success': True,
            'message': 'Dog emotion detector is ready',
            'classes': detector.classes
        }), 200
    
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500
