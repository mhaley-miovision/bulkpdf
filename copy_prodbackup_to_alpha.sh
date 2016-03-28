cd db_backups
scp -i ~/keys/vic-deploy-key.pem backup.zip ubuntu@ec2-54-164-7-90.compute-1.amazonaws.com:~
cd ..
