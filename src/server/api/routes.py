from flask import Blueprint, request, jsonify, render_template, redirect, url_for
from flask_login import login_user, logout_user, login_required, current_user
from ..game.player import Player
from ..game.world import World
from ..game.item import Item
from .models import db, User, PlayerModel

api = Blueprint('api', __name__)

# Initialize game components
world = World("Default World")  # Added name parameter
players = {}
items = {}

@api.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        data = request.json
        user = User.query.filter_by(username=data['username']).first()
        if user and user.check_password(data['password']):
            login_user(user)
            return jsonify({'message': 'Logged in successfully'}), 200
        return jsonify({'error': 'Invalid username or password'}), 401

@api.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    
    if not data or not data.get('username') or not data.get('password'):
        return jsonify({'error': 'Missing username or password'}), 400
        
    if User.query.filter_by(username=data['username']).first():
        return jsonify({'error': 'Username already exists'}), 400
        
    user = User()
    user.username = data['username']
    user.set_password(data['password'])
    
    try:
        db.session.add(user)
        db.session.commit()
        
        # Create player model for user
        player = PlayerModel(user_id=user.id)
        db.session.add(player)
        db.session.commit()
        
        return jsonify({'message': 'User registered successfully'}), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@api.route('/logout')
@login_required
def logout():
    logout_user()
    return jsonify({'message': 'Logged out successfully'}), 200

# Protect existing routes with login_required
@api.route('/api/player/<player_id>', methods=['GET'])
@login_required
def get_player(player_id):
    player = players.get(player_id)
    if player:
        return jsonify(player.to_dict()), 200
    return jsonify({'error': 'Player not found'}), 404

@api.route('/api/player', methods=['POST'])
@login_required
def create_player():
    data = request.json
    player = Player(data['name'], data['class'])
    players[player.id] = player
    return jsonify(player.to_dict()), 201

@api.route('/api/world', methods=['GET'])
@login_required
def get_world():
    return jsonify(world.to_dict()), 200

@api.route('/api/item/<item_id>', methods=['GET'])
@login_required
def get_item(item_id):
    item = items.get(item_id)
    if item:
        return jsonify(item.to_dict()), 200
    return jsonify({'error': 'Item not found'}), 404

@api.route('/api/item', methods=['POST'])
@login_required
def create_item():
    data = request.json
    item = Item(data['name'], data['type'])
    items[item.id] = item
    return jsonify(item.to_dict()), 201