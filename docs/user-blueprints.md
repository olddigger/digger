#Blueprints

One theme for a lot of NoSQL databases is the lack of a schema.

digger follows this trend and does not enforce strict rules about the data you can have - this is a good thing because it makes it very flexible.

One downside though is that digger dosn't know how to build forms for your users.

You can build forms yourself and write data using the JavaScript API.  Digger blueprints are a shortcut to the massive hassle that database forms can sometimes be.


###Adding Blueprints
Click on the 'Blueprints' tab form the warehouse gui and you will see the blueprints currently installed.

![Blueprint Home](img/blueprints/home.gif "figure 1: blueprint home")

###Editing Blueprints
Edit the blueprint by typing into the XML editor on the left.

As you type the form preview will update itself.

![XML Editor](img/blueprints/xml.gif "figure 2: blueprint XML editor")

You can also use the buttons below the preview to add fields.  The orange delete buttons will remove fields.

![Field Editor](img/blueprints/form.gif "figure 3: blueprint Form editor")

###Blueprint Format
Learning the blueprint format allows you to create felxible forms.

Read more in the [Blueprint Format](./developer-blueprints) section.