FROM ubuntu:latest

# avoid tzdata prompt while installing
ARG DEBIAN_FRONTEND=noninteractive

# install graphics dependencies and curl
RUN apt-get update
RUN apt-get install -y --no-install-recommends ca-certificates gnupg build-essential libxi-dev libgl1-mesa-dev libglu1-mesa-dev libglew-dev pkg-config curl xvfb
RUN apt-get update
RUN curl -sS https://dl.yarnpkg.com/debian/pubkey.gpg | apt-key add -
RUN echo "deb https://dl.yarnpkg.com/debian/ stable main" | tee /etc/apt/sources.list.d/yarn.list
RUN curl -sL https://deb.nodesource.com/setup_14.x | bash
RUN apt-get install -y --no-install-recommends nodejs yarn
RUN rm -rf /var/lib/apt/lists/*

ARG NODE_ENV=production

COPY . /app
WORKDIR /app

RUN yarn install

# use xvfb-run to create X11 environment
# https://github.com/stackgl/headless-gl#how-can-headless-gl-be-used-on-a-headless-linux-machine
CMD ["xvfb-run", "-s", "-ac -screen 0 1280x1024x24", "yarn", "start"]
