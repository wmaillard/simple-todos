#!/bin/bash
sudo umount /media/will/Storage1
sudo rmdir /media/will/Storage1
sudo mkdir /media/will/Storage1
sudo mount -o exec /dev/sda1 /media/will/Storage1/
ANDROID_HOME=/media/will/Storage1/Android/Sdk
export PATH=${PATH}:$ANDROID_HOME/tools:$ANDROID_HOME/platform-tools
meteor run android --verbose
: <<'END'
meteor run android-device --mobile-server <host>:<port> will point mobile builds to <host>:<port> 
as a meteor server while not affecting the web-server running locally.

meteor run can also take a --verbose argument which prints the full Cordova builds logs.
END
