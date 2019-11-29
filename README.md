# turtleweb
Web control of ROS *turtlesim*

## Installation & Requirements
The installation of ROS Hydro (or newer distro) is required. You will also need to make sure *turtlesim* and *ROSbridge* installed.

Clone this repo to your catkin workspace, and run `catkin_make`.

Then run `roslaunch turtleweb turtleweb.launch` and go to `http://hostname:8000/turtleweb`.

## Functionality & Usage
Currently, the following functions are complete:
- Move 1 step
- Move constantly and stop
- Change pen color, incl. turn pen on or off
- Change background color

You can set the values (linear-velocity and angular-velocity for moving, RGB values for changing background color, RGB values and width for changing pen color and pen switch) and hit the buttons to apply the command. Then the status of *turtlesim* will be shown above synchronously.

## Container usage
You can build a Docker container image of turtleweb by using `dockerfile`. Currently, you must go into the container and run `roslaunch` manually.

## Misc
*[roslibjs](https://github.com/RobotWebTools/roslibjs)* by RobotWebTools is used in this repository.
