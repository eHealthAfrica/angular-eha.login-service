#!/usr/bin/env bash
set -e

git clone https://github.com/eHealthAfrica/angular-eha.login-service.git deploy
cp -R dist/* deploy/dist
cd deploy
git add dist
git config user.email "ehealthafrica-ci@tlvince.com"
git config user.name "eHealth Africa CI"
git commit --all --message "chore: release $npm_package_version"
echo -e "machine github.com\n  login $CI_USER_TOKEN" >> ~/.netrc
git push origin master
cd -
rm -rf deploy
