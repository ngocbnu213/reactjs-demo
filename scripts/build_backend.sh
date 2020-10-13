export JAVA_HOME=/usr/java/jdk1.8.0_261-amd64
export PATH=${JAVA_HOME}/bin:${PATH}
export MAVEN_HOME=/opt/maven
export PATH=$PATH:$MAVEN_HOME/bin

java -version
mvn -version

cd /home/ec2-user/VJP-Employee-system/api-app
sudo cp -f /home/ec2-user/vjp-sys-enviroment/application.properties ./src/main/resources
mvn clean install -DskipTests