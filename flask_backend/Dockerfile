FROM python

WORKDIR /flask_backend

COPY . /flask_backend

RUN pip install -r requirements.txt

EXPOSE 5000

CMD ["python", "app.py"]
