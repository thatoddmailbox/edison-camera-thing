#!/bin/sh
export NODE_PATH=$NODE_PATH:/usr/local/lib/node_modules/
echo on > /sys/devices/pci0000\:00/0000\:00\:07.1/power/control
/home/root/camera/edison-camera-thing/bin/www
