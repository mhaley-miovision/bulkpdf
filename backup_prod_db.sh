sudo ssh -i ~/keys/vic-deploy-key.pem ubuntu@teal.vision mongodump
sudo scp -r -i ~/keys/vic-deploy-key.pem ubuntu@teal.vision:dump/meteor ./db_backups/$(date '+%d-%b-%Y')
cd db_backups
zip -r backup.zip $(date '+%d-%b-%Y')
cd ..
