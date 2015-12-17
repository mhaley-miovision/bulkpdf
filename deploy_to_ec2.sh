zip -r -9 deployPackage.zip mio-archy-tool-js/*
sudo scp -i ~/keys/vic-deploy-key.pem deployPackage.zip ubuntu@ec2-54-152-211-94.compute-1.amazonaws.com:
rm deployPackage.zip
echo Deployment Complete!
