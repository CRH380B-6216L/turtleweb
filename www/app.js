var app = new Vue({
    el: '#app1',
    data: {
        address: 'ws://' + location.hostname + ':9090',
        state: 'disconnected',
        ros: {},
        rosCompo: {
            cmdVel: null,
            bgB: null,
            bgG: null,
            bgR: null,
            clearing: null,
            listener: null,
            penSet: null
        },
        pose: {
            x: 0,
            y: 0,
            linear_velocity: 0,
            angular_velocity: 0,
            theta: 0
        },
        line: 0,
        angle: 0,
        backgroundB: 255,
        backgroundG: 86,
        backgroundR: 69,
        bgColorB: 255,
        bgColorG: 86,
        bgColorR: 69,
        penB: 255,
        penG: 184,
        penR: 179,
        penW: 3,
        pen: {
            Blue: 255,
            Green: 184,
            Red: 179,
            Width: 3
        },
        penOff: false,
        loopMove: null,
        alongMoving: false
    },
    methods: {
        connect() {
            var vm = this;
            vm.ros = new ROSLIB.Ros({
                url: vm.address
            });

            vm.ros.on('connection', function() {
                vm.state = 'success';
                vm.rosInit();
                vm.getPose();
                vm.getColor();
            });

            vm.ros.on('error', function(error) {
                vm.state = 'disconnected';
                console.log('Error connecting to websocket server: ', error);
            });

            vm.ros.on('close', function() {
                vm.state = 'disconnected';
                console.log('Connection to websocket server closed.');
            });
        },
        rosInit() {
            var vm = this;
            vm.rosCompo.cmdVel = new ROSLIB.Topic({
                ros: vm.ros,
                name: '/turtle1/cmd_vel',
                messageType: 'geometry_msgs/Twist'
            });
            vm.rosCompo.bgB = new ROSLIB.Param({
                ros: vm.ros,
                name: 'background_b'
            });
            vm.rosCompo.bgG = new ROSLIB.Param({
                ros: vm.ros,
                name: 'background_g'
            });
            vm.rosCompo.bgR = new ROSLIB.Param({
                ros: vm.ros,
                name: 'background_r'
            });
            vm.rosCompo.clearing = new ROSLIB.Service({
                ros: vm.ros,
                name: '/clear',
                serviceType: 'std_srvs/Empty'
            });
            vm.rosCompo.listener = new ROSLIB.Topic({
                ros: vm.ros,
                name: '/turtle1/pose',
                messageType: 'turtlesim/Pose'
            });
            vm.rosCompo.penSet = new ROSLIB.Service({
                ros: vm.ros,
                name: '/turtle1/set_pen',
                serviceType: 'turtlesim/SetPen'
            });
        },
        moveOnce() {
            var vm = this;
            lineSpd = parseFloat(vm.line);
            angleSpd = parseFloat(vm.angle);
            var twist = new ROSLIB.Message({
                linear: {
                    x: lineSpd,
                    y: 0.0,
                    z: 0.0
                },
                angular: {
                    x: 0.0,
                    y: 0.0,
                    z: angleSpd
                }
            });
            vm.alongMoving = true;
            vm.rosCompo.cmdVel.publish(twist);
            setTimeout(() => { vm.alongMoving = false }, 999);
        },
        moveAlong() {
            var vm = this;
            vm.moveOnce();
            vm.loopMove = setInterval(vm.moveOnce, 1000);
        },
        moveStop() {
            var vm = this;
            clearInterval(vm.loopMove);
        },
        setColor() {
            var vm = this;

            vm.rosCompo.bgB.set(parseInt(vm.backgroundB));
            vm.rosCompo.bgG.set(parseInt(vm.backgroundG));
            vm.rosCompo.bgR.set(parseInt(vm.backgroundR));

            vm.clearBoard();
            vm.bgColorB = vm.backgroundB;
            vm.bgColorG = vm.backgroundG;
            vm.bgColorR = vm.backgroundR;
        },
        getColor() {
            var vm = this;

            vm.rosCompo.bgB.get((value) => {vm.bgColorB = value; vm.backgroundB = value;});
            vm.rosCompo.bgG.get((value) => {vm.bgColorG = value; vm.backgroundG = value;});
            vm.rosCompo.bgR.get((value) => {vm.bgColorR = value; vm.backgroundR = value;});
        },
        clearBoard() {
            var vm = this;
            var request = new ROSLIB.ServiceRequest();
            vm.rosCompo.clearing.callService(request, () => {
                var c = document.getElementById("drawing");
                var ctx = c.getContext("2d");
                ctx.clearRect(0, 0, c.width, c.height);
                console.log('cleared');
            });
        },
        getPose() {
            var vm = this;

            vm.rosCompo.listener.subscribe(function(message) {
                    x1 = vm.pose.x * 45.090179412795976;
                    y1 = 500 - (vm.pose.y * 45.090179412795976);
                vm.pose = message;
                x2 = vm.pose.x * 45.090179412795976;
                y2 = 500 - (vm.pose.y * 45.090179412795976);
                document.getElementById('turtle').style.paddingLeft = (vm.pose.x * 45.090179412795976) + 'px';
                document.getElementById('turtle').style.paddingTop = (500 - (vm.pose.y * 45.090179412795976)) + 'px';
                document.getElementById('turtleImage').style.transform = 'rotate(' + ((-vm.pose.theta * 57.2958)+90) + 'deg';
                document.getElementById('canvas').style.backgroundColor = 'rgb(' + vm.bgColorR + ', ' + vm.bgColorG + ', ' + vm.bgColorB + ')';
                if (!vm.penOff && vm.pose.linear_velocity > 0) vm.drawAtPoint(x1, y1, x2, y2);
                //console.log('Received message on ' + listener.name + ': ' + JSON.stringify(message));
                //listener.unsubscribe();
            });
        },
        drawAtPoint(x1, y1, x2, y2) {
            var vm = this;
            var c = document.getElementById("drawing");
            var ctx = c.getContext("2d");
            ctx.beginPath();
            ctx.moveTo(x1, y1);
            ctx.lineTo(x2, y2);
            ctx.lineWidth = vm.penW;
            ctx.strokeStyle = 'rgb(' + vm.penR + ', ' + vm.penG + ', ' + vm.penB + ')';
            ctx.stroke();
        },
        setPen() {
            var vm = this;
                vm.penR = parseInt(vm.pen.Red);
                vm.penG = parseInt(vm.pen.Green);
                vm.penB = parseInt(vm.pen.Blue);
                vm.penW = parseInt(vm.pen.Width);
            var request = new ROSLIB.ServiceRequest({
                r: vm.penR,
                g: vm.penG,
                b: vm.penB,
                width: vm.penW,
                off: (vm.penOff ? 1 : 0)
            });
            vm.rosCompo.penSet.callService(request, () => {
            });
        },
        penOnOff() {
            var vm = this;
            vm.penOff = !vm.penOff;
            vm.setPen();
        }
    },
    created() {
        console.log(location.hostname);
        console.log(this.address);
        this.connect();
    }
});
