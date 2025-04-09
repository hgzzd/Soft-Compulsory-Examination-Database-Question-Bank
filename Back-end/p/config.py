"""
@Author：失去了才知道珍惜
@Time：2025-02-22 0022 14:37
@FileName: config.py
@Description：todo: 
"""

SQLALCHEMY_TRACK_MODIFICATIONS = False  # 关闭SQLAlchemy事件系统
SECRET_KEY = "dgashrra"


# 数据库的配置信息
HOSTNAME = '127.0.0.1'
PORT = '3306'
DATABASE = 'test'
USERNAME = 'root'
PASSWORD = '123456'
DB_URI = 'mysql+pymysql://{}:{}@{}:{}/{}?charset=utf8mb4'.format(USERNAME, PASSWORD, HOSTNAME, PORT, DATABASE)
SQLALCHEMY_DATABASE_URI = DB_URI
