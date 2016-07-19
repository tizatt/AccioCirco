FROM	ubuntu
RUN	apt-get update
RUN	apt-get install -y nodejs
RUN	apt-get install -y nodejs-legacy
RUN	apt-get install -y npm
COPY . /src
RUN cd /src; npm install
EXPOSE 3000
CMD cd /src; npm start
