# Set up commit hooks
git config core.hooksPath .husky

# Install all packages
npm install
cd client && npm install
cd ../server && npm install