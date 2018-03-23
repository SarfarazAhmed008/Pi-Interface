# Pi-Interface

Controlling LED lights with Raspberry Pi using Web Interface

The Raspberry Pi is a small (it's the size of a credit card) single board computer that we can connect to just about any TV or monitor, add a keyboard, and have a complete and functional desktop computer. And it only costs about $35 to get started. It allows us to do everything we could do with a regular Linux computer (Connecting to the internet, watching videos, launching applications) but also to interact with the world surrounding it, just like an Arduino.

In our project we will control LED lights with Raspberry Pi. Firstly directly from the Raspberry Pi itself, then from any device in our house like our Smartphone or our tablet via web interface.

We're going to be using several different programming languages (Python, HTML, CSS, and Javascript) and we will also use a pre-built framework called WebIOPi, which we'll setup to run on our Pi and serve a web app to control our project with a bit of configuration.


Requirements
•	A Raspberry Pi set up with Raspbian, connected to our local network, and running an SSH server

•	LEDs

•	At least one 200 or 330 Ohm resistor

•	a solder less bread board, a breakout cobbler and some jumpers

•	Notepad++ for writing python code

•	A copy of Filezilla or other app that will let us use SCP to copy files to and from our Pi


Setting up Raspberry Pi

Assembling the Pi and its enclosure:

The Raspberry Pi itself needs no assembly — it's ready to connect right out of the box. But as mentioned, we need somewhere to put it to keep the delicate electronics from shorting out.

Installing NOOBS to your SD card:

About SD Card

•	We need a full-sized SD card to insert into our Pi. We can use a micro, but we'll need a full-sized adapter.

•	Use an SD card that's at least 4GB

Download the base NOOBS install:

NOOBS (New Out Of Box Software) is a setup program that allows us to choose from a variety of operating systems for our Pi. It's not the speediest way to do things, and hardcore Linux types are better just flashing the .img file of the distro they want directly to the SD card. But for our purposes, NOOBS is perfect.


Unzip the download and copy the files to the SD card:

Unzip the file we downloaded in the step above, and we'll see a single folder. Open that folder in our file explorer application on the computer.

Open a new file explorer window and navigate to the freshly-formatted SD card. There should be nothing there. 
Highlight ALL the files from our download, and drag them to the SD card window. This will take a few minutes.
Connecting everything and turning it on NOOBS, OS installation, and options:
If everything above works correctly, we'll see this after our Pi goes through the first boot. This can take a while. This is NOOBS.

This takes about 5 minutes for an 8GB SD card.
NOW, it's a computer.

Controlling GPIO pins with Python
Setting up Pi for GPIO programming
We need to install a few things to get Python to talk to the GPIO pins and control them. If we're using the standard Raspian OS, it's an easy affair. Fire up our terminal if we're in the GUI and run these commands to install what we need:
Code:

sudo apt-get update
sudo apt-get install python-dev
sudo apt-get install python-rpi.gpio


What we're doing: 
The first command updates our package manager database so we're sure to get the latest version of our files.

The second command installs any missing Python development tools.
The third command installs Python libraries to control the GPIO pins.

![alt tag](https://user-images.githubusercontent.com/21248324/37840575-aa800188-2ee7-11e8-8f72-6ae4439e8b28.jpg)

Wiring an LED to a GPIO pin

![alt tag](https://user-images.githubusercontent.com/21248324/37840576-aabc050c-2ee7-11e8-983a-1d82016907de.png)

This diagram shows a normal LED wired to ground (pin 6) and GPIO 18 (pin 12). Note the resistor between the LED and the ground. This is a safety precaution to keep our LED from popping. It's always best to use a resistor, even with a single LED. For standard LEDs and 3.3v GPIO pins, any resistor between 200 Ohms and 1K Ohms should work fine. I use 330 Ohm resistors because we have a bin full of them.

We use a breadboard and breakout cobbler, or we can use female jumpers, or we could even solder the connections if this is a permanent installation.

LED has two legs coming out of it. One is longer than the other. LEDs are polarity sensitive, meaning they have a positive and a negative side. The longer lead (they're call electrodes) is the positive. It will connect to the GPIO pin. For the LED_test code attached to this post, connect it to pin 11, which is GPIO 17. The shorter lead connects to one end of our resistor, and the other end of our resistor connects to ground, which is pin 6.

The Code:

[1]import RPi.GPIO as GPIO ##imports the GPIO Library
[2]
[3]## GPIO pin manipulation
[4]GPIO.setmode(GPIO.BCM) ## Use Broadcomm pin numbers
[5]GPIO.setup(17, GPIO.OUT) ## Sets GPIO pin 17 as an output 
[6]GPIO.output(17,True) ## Sets GPIO pin 17 to high (on, 3.3v)
[7]
[8]
[9]## Error handling and cleanup
[10]counter = 0  
[11] 
[12]try:  
[13]    ## 10 second counter  
[14]    while counter < 4500000:   
[15]        counter += 1  
[16]    print "%d" % counter  
[17]  
[18]except KeyboardInterrupt:  
[19]    ## This code runs when you break the program with CTRL+c
[20]    ## then the code in the finally block will run
[21]    print "\n", counter 
[22]  
[23]except:  
[24]    ## This code runs when an error is encountered
[25]    ## then the code in the finally block will run
[26]    print "Put error handling code here instead of this message"  
[27]  
[28]finally:  
[29]	## This code runs any and every time the code exits 
[30]	## even if there was an uncaught error.
[31]	## We're using it to reset the GPIO pin
[32]    GPIO.cleanup()


Software installation

We need to have our Pi set up to use Python to communicate with the GPIO pins, and free up some resources since we're running a server and not a GUI. Finally, we need to install and configure the WebIOPi framework. Let's go through each step.
Freeing RAM from the GPU

SSH into our Pi now that it's up and running. We're going to free some of that up to make sure we have plenty for our headless server. This step is optional, because there won't be a lot of load on our server.
At the command prompt, enter this to open the configuration utility:

sudo raspi-config

In the menu that opens, use the arrow keys on your keyboard to scroll down to number 8 Advanced Options and hit the enter or return key.

Set the number on the second line to 16 as shown. This allows the system to use the rest of the RAM for computation and overhead a very good thing on any server.

Use the tab key on your keyboard choose OK. This will put us back on the configuration menu. Use the tab key to choose Finish, choose Yes to reboot. When the Pi has rebooted, SSH back in and we'll continue.


Installing the WebIOPi framework

The GPIO pins can only be accessed via Python as the root user this is why every time we run a Python script to make them do something, we need to append sudo to it. It's another of those security things. We could edit some permissions (chwon /dev/mem for those that just have to know) and let normal users control the pins with Python, but breaking security even on a board that only sits on your desk isolated from the outside world is not a good thing to do.


Because we need to run things as root, a standard webserver/php/cgi setup to run scripts via the network just won't work. Luckily, there is a ready-made framework that handles all this and more called WebIOPi. 


You won't find it in your package manager, but installing it is still pretty easy. 

Make sure we're in your home folder:

Code:
cd ~

Get the file from the projects Sourceforge page:
Code:


wget  http://sourceforge.net/projects/webiopi/files/WebIOPi-0.7.0.tar.gz

When it's finished downloading, extract it into it's own directory:

Code:

tar -xvzf WebIOPi-0.7.0.tar.gz

Enter the directory you just created:

Code:

cd WebIOPi-0.7.0/

Run the setup script (as root):

Code:

sudo ./setup.sh

Setup might take a few minutes, and will make sure we have everything needed to use the framework. Once finished, you can test everything by running this command:

Code:

sudo webiopi -d -c /etc/webiopi/config


and pointing the web browser on your computer to http://YOUR.PI.IP.ADDRESS:8000 (we enter it Pi's IP address and not those words ). The user name is webiopi and the password is raspberry (we'll get rid of that login requirement later). Look around, and be sure to have a look at the GPIO Header link. On that page, set GPIO 17 as an output and click the pin 11 button to toggle our LED on and off.

After we've blinked your LED a few times and explored things, go back to our SSH window and quit the service with CTRL+C and we're back at our command prompt.


Now it's time to interface with the webiopi service, and build a web app.

Building a web app interface
Here, we're going to edit the default configuration of the webiopi service, and add our own code to run when it's called. We'll be editing files on our computer and moving them over to the Pi using an SCP client. we will use Filezilla.
 Open it on your computer, and use the URL sftp://YOUR.PI.IP.ADDRESS; your Pi username and password; port 22 then press the quickconnect button.
 
We’ll see our computers files on the left, and the Raspberry Pi's files on the left. Click a folder to open it. Click the two dots (..) next to the folder icon at the top of the list to move up one level. Drag files from one pane to the other to transfer them. Now we can edit the code on your computer, then transfer the files to our Pi easily.

Create project folder

Before we move any files, we have to have somewhere to move them. Let's build a project skeleton on our Pi. From the command prompt

Code:

cd ~

Create a Project folder:

Code:

mkdir Projects

Create a Webio project folder:

Code:

mkdir Projects/Webio

Move to the Webio project folder:

Code:

cd Projects/Webio

Inside our Webio project, make an html folder:

Code:

mkdir html

Inside the html folder, make a folder for images, scripts and stylesheets:

Code:

mkdir html/img
mkdir html/scripts
mkdir html/styles

Back-ground image for our web-app:
We downloaded a background image from the internet and named it LED-icon.png
Then
•	Open Filezilla and log in to our Pi

•	Find the LED-icon.png file we downloaded to our computer in the left pane of the window

•	In the right pane, navigate to /home/username/Projects/Webio/html/img

•	Drag the LED-icon.png file from the left pane to the right.

•	$profit.

The javascript
Code:


webiopi().ready(function() {
        		webiopi().setFunction(17,"out");
        		var content, button;
        		content = $("#content");
        		button = webiopi().createGPIOButton(17,"My LED");
        		content.append(button);		
        });

This is simple stuff to communicate with JQuery and the webiopi framework. Let's look at what it's doing.

webiopi().ready(function() This says when the webiopi service is ready, this is the function we want to be created and started.
webiopi().setFunction(17,"out") We want the webio service to send a command to set GPIO 17 as an output, because we'll be sending signals out to it.

var content, button Set a variable named content, and make it a button.

content = $("#content") 

The content variable is also going to be defined in our css and html files as #content. When we refer to #content in our html or css, we want the webiopi framework to create what is defined with the content variable.

button = webiopi().createGPIOButton(17,"My LED") 

The button we want to create is a GPIO button (webiopi can make other kinds, for our purposes we want a GPIO interface) that controls GPIO 17 and has the label My LED.

content.append(button) 

Append this code for a button to any other code for other buttons. We can make more than one button using the same variables and same definition in CSS, which is handy when we're writing out our CSS and HTML. The webiopi framework will create them in the order they are listed in this file. We're using one to keep things simple.

The brackets, parentheses, quotes and semi-colons are part of the javascript language, and tells the js interpreter in a browser where one command ends and another begins. Be sure to copy it exactly as written, including the indentation. Save the file as bacon.js so it works in our html.

When you have this file created and saved on our computer, copy it to Projects/Webio/html/scripts with Filezilla.

The CSS

Code:

body {
			background-color:#000000;
			background-image:url('/img/LED-icon.png');
			background-repeat:no-repeat;
			background-position:center;
			background-size:cover;
			font: bold 18px/25px Arial, sans-serif;
			color:LightGray;
			}
        
button {
        		display: block;
        		position: relative;
        		margin: 10px;
        		padding: 0 10px;
        		text-align: center;
        		text-decoration: none;
        		width: 130px;
        		height: 40px;
        		font: bold 18px/25px Arial, sans-serif;    				
        		color: black;
        				
        	  	  text-shadow: 1px 1px 1px rgba(255,255,255, .22);
        		 -webkit-border-radius: 30px;
   			 -moz-border-radius: 30px;
    		    	  border-radius: 30px;
 
    			 -webkit-box-shadow: 1px 1px 1px rgba(0,0,0, .29), inset 1px 1px 1px rgba(255,255,255, .44);
    			 -moz-box-shadow: 1px 1px 1px rgba(0,0,0, .29), inset 1px 1px 1px rgba(255,255,255, .44);
    			  box-shadow: 1px 1px 1px rgba(0,0,0, .29), inset 1px 1px 1px rgba(255,255,255, .44);
 
    			-webkit-transition: all 0.15s ease;
    			-moz-transition: all 0.15s ease;
    			-o-transition: all 0.15s ease;
    			-ms-transition: all 0.15s ease;
    			transition: all 0.15s ease;
        		}
        		
input[type="range"] {
        		display: block;
        		width: 160px;
        		height: 45px;
        		}
        		
#gpio17.LOW {
        		background-color: Gray;
        		color: Black;
        		}
        		
#gpio17.HIGH {
        		background-color: Blue;
        		color: LightGray;
        		}


In general, the css is what tells a web browser (or webview component in an app) how to draw the page. CSS is extremely powerful, and can be extremely complicated. Besides drawing some nice buttons on a tiny web page like we're doing.

The body block this tells the browser engine to draw a page that's all black, use the LED-icon.png file in the /img folder as the background (centered and stretched to cover the screen without tiling), and use a light gray 18 point bold Arial font for any words written on the page that aren't styled themselves. As a fallback if the user does not have an Arial font defined, we can use a san-serif font at 25 points.

The button block This tells the browser engine to display a button that's 130 pixels wide and 40 pixels tall. It's a block and not inline, so each button needs to be on its own line. It also defines a little margin around the button and gives some external padding in case we position it right against something. It tells it to use the same font and style as the body block, but use black instead of light grey. It also has a few extras for text shadow and button shadow, as well as a slight transition effect so it looks pretty when we press it. Notice that these need defined separately for webkit (Chrome, Safari and new versions of Opera), Firefox, Internet Explorer and old versions of Opera.

The input type block the webiopi service wants this to tell it that this button is an input to the service.

The #gpio.17 high and low blocks the webiopi service will change the button and font color based on whether GPIO 17 is HIGH (on) or LOW (off). All we have to do define the colors, and when the state changes webiopi triggers the switch.


Indentation isn't as important in a css file, but the brackets and all the punctuation marks are. Copy this file exactly as it is written to our editor, and save it as bacon.css so it works with our html. When done, we copy it to the Projects/Webio/html/styles folder on our Pi.

The html

<!DOCTYPE html PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN" "http://www.w3.org/TR/html4/loose.dtd">
<html>
<head>
        <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
        <meta name="mobile-web-app-capable" content="yes">
        <meta name="viewport" content = "height = device-height, width = device-width, user-scalable = no" /> 
        <title>Pi-lights</title>
        <script type="text/javascript" src="/webiopi.js"></script>
        <script type="text/javascript" src="/scripts/bacon.js"></script>
        <link rel="stylesheet" type="text/css" href="/styles/bacon.css">
        <link rel="shortcut icon" sizes="196x196" href="/img/LED-icon.png" />
</head>
<body>
		<div id="content" align="center"></div>
		<p align="center">Push button; receive bacon</p>
</body>
</html>

In the head section

Code:

meta name="mobile-web-app-capable" content="yes"
meta name="viewport" content = "height = device-height, width = device-width, user-scalable = no" 
link rel="shortcut icon" sizes="196x196" href="/img/LED-icon.png"

The first line tells Chrome and mobile Safari that this can be saved to a mobile desktop as a web app, which is about a million Internet points worth of awesome. We can do this through the Chrome menu, or the share menu in mobile Safari.
The second line says that this should be displayed at the width and height of a mobile device's screen and not be resizable.
The final line tells the OS what icon to use if we make a web app shortcut.

Also in the head section are the lines that tell the browser where to find assets to build the page:

Code:

script type="text/javascript" src="/webiopi.js"
script type="text/javascript" src="/scripts/bacon.js"
link rel="stylesheet" type="text/css" href="/styles/bacon.css"

The first line calls the main webiopi framework javascript, which is hardcoded in the server root. We include this line every time we use webiopi.

The next two lines tell the browser where to look for our own javascript and the css to draw the page. If we used the same Project folder layout as i did, this works as-is. If we changed anything, we'll need to adjust the path accordingly.

The body section is super simple. All the break tags (/br) are so the button is in the position I like it in. Add or remove break tags to move it up and down on the page. We could use css to position it, but this is an easy hack. These two lines do the work:
	<div id="content" align="center"></div>
        <p align="center">Push button; receive bacon</p>

The first line here tells our browser to display the content div (we defined that in our javascript) and align it in the center of the page. This can be one button, or 100 buttons it's all handled in the javascript.

The next line tells the browser what to print, and to also put it center justified. We can change this.

Once we have this file all written up in our editor, we save it as index.html. Then copy it to our Projects/Webio/html folder on our Pi. Note this is in the top level of the html folder, not in a sub folder.

Starting the WebIOPi service
This is all done in your SSH window.

The password

The default username and password for the webiopi service is webiopi:raspberry . We have two options here — change it, or just get rid of the login altogether. We opted to remove the password completely. We've removed the default pi user account (changing the password is just as safe) and webiopi has no system-wide root permissions. Even with my little app exposed to the internet. Always consider the stored data on any server that you expose to the world, and decide from there how secure it has to be. /rant

To change the password:

The webiopi service uses an encrypted file to store login. We can't just edit it by hand, but there's an included tool to recreate it.

Code:

sudo webiopi-passwd

The program will prompt for a new username and password, which will then verify. The file is encrypted, hashed and saved to /etc/webiopi/passwd , If we're using webiopi in a way that needs security, what's provided is excellent.

To get rid of the password requirement:

Code:

sudo mv /etc/webiopi/passwd /etc/webiopi/passwdOLD

The server sees there is no valid password file, and allows anonymous connections.

Edit the default configuration

By default the webiopi service looks for the user generated code in /home/username/WebIOPi/htdocs . That whole folder is worth exploring, but for all our work to show up we need to point it in the right direction.
Edit the configuration file with nano, as root:

Code:

sudo nano /etc/webiopi/config

Code:

[HTTP]
# HTTP Server configuration
enabled = true
port = 8000

# File containing sha256(base64("user:password"))
# Use webiopi-passwd command to generate it
passwd-file = /etc/webiopi/passwd

# Change login prompt message
prompt = "WebIOPi"

# Use doc-root to change default HTML and resource files location
#doc-root = /home/pi/webiopi/examples/scripts/macros
doc-root = /home/Projects/Webio/html
# Use welcome-file to change the default "Welcome" file
#welcome-file = index.html

#————————————————————————————————————#

Notice the # Use doc-root to change default HTML and resource files location portion. Comment out any line under it by prefixing them with a # sign, then add the path to our html folder we created earlier. Place the right path there.
Code:
doc-root = /home/pi/Projects/Webio/html

Adjust accordingly.

We change the default port from 8000. We probably don't if you're not running any other servers on our Pi.
Save and exit nano by typing CRTL+X, sat Y that you DO want to save the file, and use the location that pops up by pressing enter. We're now ready to fire this bad boy up.

Starting the service with debugging at the console
We run the service with debugging enabled and logging to the console. To do this, run the following in your terminal:

Code:

sudo webiopi -d -c /etc/webiopi/config

Our terminal will start scrolling lines of text — that's normal. We won't be able to read all of it as it whooshes by, but we can watch it as you use the web app and see what it says if things do not work as expected. To quit, just press CTRL+C and it will end gracefully.

Starting webiopi as a proper service

Once we have everything working the way we want it to work, we can have webiopi start as a background service. We'll still have log files written in /var/log when errors occur, but our console will be free and we'll get less verbosity while it runs. To do this:

Code:

sudo /etc/init.d/webiopi start

To check the status of the webiopi service (see if it's running):

Code:

sudo /etc/init.d/webiopi status

To halt the service:

Code:

sudo /etc/init.d/webiopi stop

To restart the service (maybe you changed the config):

Code:

sudo /etc/init.d/webiopi restart

Finally, to start the service at boot, every time your Pi boots up:

Code:

sudo update-rc.d webiopi defaults

If we want it to no longer start at boot:

Code:

sudo update-rc.d webiopi remove

Connecting

That's the best part.
We have opened a web browser. Enter the IP address of our Pi (the same one we use for SSH).

We see our work in all, and pressing the button should turn the LED on and off.


