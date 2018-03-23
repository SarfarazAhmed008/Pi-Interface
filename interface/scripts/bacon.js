 webiopi().ready(function() {
        		webiopi().setFunction(17,"out");
        		webiopi().setFunction(18,"out");
        		webiopi().setFunction(22,"out");
        		webiopi().setFunction(23,"out");
        		webiopi().setFunction(24,"out");
        		
        		var content, button;
        		content = $("#content");
        		
        		button = webiopi().createGPIOButton(17,"Purple LED");
        		content.append(button);
        		
        		button = webiopi().createGPIOButton(18,"Blue LED");
        		content.append(button);
        		
        		button = webiopi().createGPIOButton(22,"Green LED");
        		content.append(button);
        		
        		button = webiopi().createGPIOButton(23,"Yellow LED");
        		content.append(button);
        		
        		button = webiopi().createGPIOButton(24,"Red LED");
        		content.append(button);
        		
        });