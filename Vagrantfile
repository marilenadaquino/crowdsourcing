VAGRANTFILE_API_VERSION = "2"

$bootstrap = <<SCRIPT
apt-get update
apt-get install -y bzip2
apt-get install -y python-pip python-dev python3-pip
apt-get install -y curl
apt-get install -y xvfb
apt-get -y install openjdk-8-jdk

apt install -y python3.7
update-alternatives --install /usr/bin/python3 python3 /usr/bin/python3.6 1
update-alternatives --install /usr/bin/python3 python3 /usr/bin/python3.7 2
python3.7 -m pip install pip
SCRIPT

$install = <<SCRIPT
BLAZEGRAPH_PORT=3000
BLAZEGRAPH_PATH="/var/lib/blazegraph.jar"
APP_DIR="/app"

if [ ! -f "$BLAZEGRAPH_PATH" ]; then
	curl -L "https://github.com/blazegraph/database/releases/download/BLAZEGRAPH_2_1_6_RC/blazegraph.jar" --output $BLAZEGRAPH_PATH
fi

SCRIPT

$web_install = <<SCRIPT
BLAZEGRAPH_PORT=3000
BLAZEGRAPH_PATH="/var/lib/blazegraph.jar"
APP_DIR="/app"

echo -n "Installing webapp..."
python3.7 -m pip install --upgrade pip
python3.7 -m pip install -r $APP_DIR/requirements.txt

SCRIPT

$web_run = <<SCRIPT
BLAZEGRAPH_PORT=3000
BLAZEGRAPH_PATH="/var/lib/blazegraph.jar"
APP_DIR="/app"

lsof -ti tcp:3000 | xargs kill
java -Dfile.encoding=UTF-8 -Dsun.jnu.encoding=UTF-8 -server -Xmx2g -Djetty.port=3000 -Djetty.host=127.0.0.1 -Dbigdata.propertyFile=/app/blaze.properties -jar /var/lib/blazegraph.jar &
sleep 3

cd $APP_DIR
python3 app.py 8080 &
SCRIPT

Vagrant.configure(VAGRANTFILE_API_VERSION) do |config|
  # Every Vagrant virtual environment requires a box to build off of.
  config.vm.box = "hashicorp/bionic64"
  config.vm.synced_folder "./", "/app", create: true
  config.vm.synced_folder "./data/", "/data", create: true

  config.vm.network "forwarded_port", guest: 8080, host: 8080
  config.vm.network "forwarded_port", guest: 3000, host: 3000
 
  config.vm.provider "virtualbox" do |v|
    v.memory = 4096
  end
  
  config.vm.provision "shell", inline: $bootstrap
  config.vm.provision "shell", run: "always", inline: $install, privileged: true
  config.vm.provision "shell", run: "always", inline: $web_install, privileged: true
  config.vm.provision "shell", run: "always", inline: $web_run, privileged: false
end