from datetime import datetime
import wtforms
from flask import Flask, request, render_template, redirect, url_for
import config
from flask_migrate import Migrate
from wtforms import StringField, IntegerField, validators
from wtforms.validators import InputRequired
from flask_sqlalchemy import SQLAlchemy
app = Flask(__name__)
app.config.from_object(config)
db = SQLAlchemy(app=app)
migrate = Migrate(app=app, db=db)
@app.route("/", methods=["GET", "POST"])
def index():
    form = TopicForm(request.form)
    if request.method == "POST" and form.validate():
        try:
            new_topic = Topic(
                topic_name=form.topic_name.data,
                topic_type=form.topic_type.data,
                Option_A=form.Option_A.data,
                Option_B=form.Option_B.data,
                Option_C=form.Option_C.data,
                Option_D=form.Option_D.data,
                Answer=form.answer.data,
                Explained=form.Explained.data,
                topic_year=str(form.topic_year.data),
                topic_month=str(form.topic_month.data)
            )
            db.session.add(new_topic)
            db.session.commit()
            return redirect(url_for('index', success=True))
        except Exception as e:
            db.session.rollback()
            print(f"Database error: {e}")
            form.form_errors = ["数据库保存失败，请检查数据格式"]
    return render_template("index.html", form=form)

class Topic(db.Model):
    __tablename__ = "topic"
    id = db.Column(db.Integer, primary_key=True)
    topic_name = db.Column(db.Text, nullable=False)
    topic_type = db.Column(db.String(20), nullable=False)
    Option_A = db.Column(db.Text, nullable=False)
    Option_B = db.Column(db.Text, nullable=False)
    Option_C = db.Column(db.Text, nullable=False)
    Option_D = db.Column(db.Text, nullable=False)
    Answer = db.Column(db.Text, nullable=False)
    Explained = db.Column(db.Text)
    topic_year = db.Column(db.String(10))
    topic_month = db.Column(db.String(10))
    create_user = db.Column(db.String(100), default="子渡")
    create_time = db.Column(db.DateTime, default=datetime.now)

class TopicForm(wtforms.Form):
    topic_name = StringField("题目", [validators.InputRequired()])
    topic_type = StringField("类型", [validators.InputRequired()])
    Option_A = StringField("选项A", [validators.InputRequired()])
    Option_B = StringField("选项B", [validators.InputRequired()])
    Option_C = StringField("选项C", [validators.InputRequired()])
    Option_D = StringField("选项D", [validators.InputRequired()])
    answer = StringField("答案", [validators.InputRequired()])
    Explained = StringField("详解")
    topic_year = IntegerField("年份", [validators.InputRequired()])
    topic_month = IntegerField("月份", [validators.InputRequired()])




if __name__ == '__main__':
    app.run(debug=True, host="0.0.0.0", port=5000)
