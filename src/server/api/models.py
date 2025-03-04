from flask_sqlalchemy import SQLAlchemy
from flask_login import UserMixin
from werkzeug.security import generate_password_hash, check_password_hash

db = SQLAlchemy()

class User(UserMixin, db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    password_hash = db.Column(db.String(256), nullable=False)
    player = db.relationship('PlayerModel', backref='user', uselist=False)

    def set_password(self, password):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)

class PlayerModel(db.Model):
    __tablename__ = 'players'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'))
    x = db.Column(db.Float, default=0)
    y = db.Column(db.Float, default=0)
    health = db.Column(db.Integer, default=100)
    inventory = db.Column(db.JSON, default=list)
    equipped_item = db.Column(db.Integer, default=0)
    last_save = db.Column(db.DateTime, default=db.func.now())

class ItemModel(db.Model):
    __tablename__ = 'items'

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    item_type = db.Column(db.String(50), nullable=False)

class EnemyModel(db.Model):
    __tablename__ = 'enemies'

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    health = db.Column(db.Integer, default=50)
    attack_pattern = db.Column(db.String(200), nullable=False)

class WorldModel(db.Model):
    __tablename__ = 'worlds'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(80), nullable=False)
    seed = db.Column(db.Integer, nullable=False)
    tiles = db.Column(db.JSON)
    created_at = db.Column(db.DateTime, default=db.func.now())