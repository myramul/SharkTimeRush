**SHARK TIME RUSH**
    - Shark Time Rush is an endless runner game.
    - Credits: John Fentnor, Kyle Goodey, Mehvish Hussain, Myra Mulongoti, Nate Pyram, Ben Simens, Samina Mussarat


**INSTALLATION AND SET UP INSTRUCTIONS**
- Download the files from the GitHub Repository here: https://github.com/myramul/SharkTimeRush
        (Click the green "Code" Button and then select "Download Zip")

- Once the zip is downlaoded, unpack the file

- Open the SharkTimeRush folder in VSCode

- In VSCode, click on the extensions tab (4 squares with one sticking out)
    - Once in the extensions tab, search for **"Live Server"** and install this extension 
    (or follow this link: https://marketplace.visualstudio.com/items?itemName=ritwickdey.LiveServer)

    - Once Live Server is installed, open the index.html file and click the **"Go Live"** button in the bottom right panel of the VScode window

    - Or, right click the index.html file in the Explorer and select **"Open with Live Server"**

    - The port will be visible and now the game should be running on that port on your network

    - It should automatically open a browser window with the game.

    - To close the server once you are done playing, simply click on the Port button that replaced the Go Live button


**DORCHAK MODE (HOW TO MODIFY THE DIFFICULTY OF THE GAME)**
- Open the 'obstacle.js' file

- Right at the top of the file there are 3 constants (Line 12,13,14): 
    - SPEED, OBSTACLE_INTERVAL_MIN, and OBSTACLE_INTERVAL_MAX

- If you lower the starting speed, and increase the obstacle min and max values, 
  the game will be significantly easier.

- Some good values to try to make the game easier are:
    SPEED = 0.03, 
    OBSTACLE_INTERVAL_MIN = 650
    OBSTACL_INTERVAL_MAX =  2350