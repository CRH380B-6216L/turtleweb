FROM ros:kinetic

WORKDIR ~/catkin_ws/
ADD www ./src/turtleweb/www
ADD launch ./src/turtleweb/launch/
COPY CMakeLists.txt package.xml ./src/turtleweb/

RUN echo "source /opt/ros/kinetic/setup.bash" >> ~/.bashrc && \
echo "export QT_QPA_PLATFORM='offscreen'" >> ~/.bashrc && \
/bin/bash -c "source ~/.bashrc" && \
apt-get update && \
apt-get install -y ros-kinetic-rosbridge-server ros-kinetic-turtlesim ros-kinetic-roswww && \
/bin/bash -c ". /opt/ros/kinetic/setup.bash; catkin_make"

# CMD ls -la /root/catkin_ws/devel && /bin/bash -c ". ~/catkin_ws/devel/setup.bash" && roslaunch turtleweb turtleweb.launch

EXPOSE 8000 9090 11311
