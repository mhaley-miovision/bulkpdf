zip -r -9 odtDeployPackage.zip od-tool/* od-tool/.meteor/packages
sudo scp -i ~/keys/vic-deploy-key.pem odtDeployPackage.zip ubuntu@ec2-52-91-15-61.compute-1.amazonaws.com:
rm odtDeployPackage.zip
echo Deployment Complete!
