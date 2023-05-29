#!/bin/sh
# Update OS
sudo apt-get update
sudo apt-get upgrade -y
sleep 30

# Install Node.js
sudo apt-get install curl
curl -sL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs
sleep 15
whereis node
echo "npm version is $(npm --version)"

# Install unzip
sleep 15
echo "Installing unzip"
sudo apt-get install unzip

# Unzip file
sleep 15
unzip /home/ubuntu/webservice.zip -d /home/ubuntu/webservice
sudo rm -rf /home/ubuntu/webservice.zip

# # Install global-bundle.pem for RDS
# sleep 5
# cd /home/ubuntu
# wget https://truststore.pki.rds.amazonaws.com/global/global-bundle.pem

# Move file and install dependencies
sleep 15
cd /home/ubuntu/webservice
sudo npm install

# Create the log file directory and ADPtest.log file and modify file permissions
sleep 15
sudo mkdir -p /home/ubuntu/webservice/logs
sudo touch /home/ubuntu/webservice/logs/adp.log
sudo chmod 777 /home/ubuntu/webservice/logs/adp.log

# Install Unified CloudWatch Agent and modify the manually created cloudwatch-config.json file to the right place
sleep 15
cd /home/ubuntu
wget https://s3.us-east-1.amazonaws.com/amazoncloudwatch-agent-us-east-1/ubuntu/amd64/latest/amazon-cloudwatch-agent.deb
sudo dpkg -i -E amazon-cloudwatch-agent.deb
sudo cp /home/ubuntu/webservice/cloudwatch-config.json /opt/cloudwatch-config.json
sudo /opt/aws/amazon-cloudwatch-agent/bin/amazon-cloudwatch-agent-ctl \
-a fetch-config \
-m ec2 \
-c file:/opt/cloudwatch-config.json \
-s
