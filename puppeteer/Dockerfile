# https://dev.to/cloudx/how-to-use-puppeteer-inside-a-docker-container-568c
FROM node:slim

# Defining env vars that can be set at build time to contain your credentials
ARG wfm_email=""
ARG wfm_password=""

ENV WFM_EMAIL=$wfm_email
ENV WFM_PASSWORD=$wfm_password

# Install Google Chrome Stable and fonts
# Note: this installs the necessary libs to make the browser work with Puppeteer.
RUN apt-get update && apt-get install gnupg wget -y && \
  wget --quiet --output-document=- https://dl-ssl.google.com/linux/linux_signing_key.pub | gpg --dearmor > /etc/apt/trusted.gpg.d/google-archive.gpg && \
  sh -c 'echo "deb [arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main" >> /etc/apt/sources.list.d/google.list' && \
  apt-get update && \
  apt-get install google-chrome-stable -y --no-install-recommends && \
  rm -rf /var/lib/apt/lists/*

COPY . ./wfm-auto

WORKDIR /wfm-auto

RUN npm install
RUN node ./node_modules/puppeteer/install.js

ENTRYPOINT npm start