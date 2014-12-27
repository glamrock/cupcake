#!/bin/bash

cd /path/to/repo
git remote update
if [[ -n $(git diff origin/master) ]]; then
  git pull
  curl -d '{"title": "Flashproxy was updated"}' https://api.github.com/repos/glamrock/cupcake/issues -u login:password
fi
