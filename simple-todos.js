Tasks = new Mongo.Collection("tasks");

if (Meteor.isClient) {
  // This code only runs on the client
   Meteor.subscribe("tasks");
   
  Template.body.helpers({
    tasks: function(){
		 if (Session.get("hideCompleted")) {
        // If hide completed is checked, filter tasks
        return Tasks.find({checked: {$ne: true}}, {sort: {createdAt: -1}});
      } else {
        // Otherwise, return all of the tasks
        return Tasks.find({}, {sort: {createdAt: -1}});
      }
    },
    hideCompleted: function () {
      return Session.get("hideCompleted");
	},
    incompleteCount: function () {
      return Tasks.find({checked: {$ne: true}}).count();
	}
	});
  
  Template.body.events({
    "submit .new-task": function (event) {
      // Prevent default browser form submit
      event.preventDefault();
 
      // Get value from form element
      var text = event.target.text.value;
 
      // Insert a task into the collection
      Meteor.call("addTask", text);
 
      // Clear form
      event.target.text.value = "";
    },
    "change .hide-completed input": function (event) {
      Session.set("hideCompleted", event.target.checked);
	}
  });
    Template.task.helpers({
    isOwner: function () {
      return this.owner === Meteor.userId();
    }
  });
    Template.task.events({
    "click .toggle-checked": function () {
      // Set the checked property to the opposite of its current value
     Meteor.call("setChecked", this._id, !this.checked);
    },
    "click .delete": function () {
      Meteor.call("deleteTask", this._id);
	},
    "click .toggle-private": function () {
      Meteor.call("setPrivate", this._id, ! this.private);
	},
	"click #targetDate": function () {
		console.log(this);
      console.log(event.target);
	  
	  var target = event.target;
	  
	  if(target.tagName == "TD"){
	  target.innerHTML = '<input class = "change-task" type="text" name="text" placeholder="'+this.text+'">';
	  }
	  $(".change-task").focus();
	},
	"keydown .change-task, blur .change-task": function (event) {
      // Prevent default browser form submit
      console.log(this);
	  if(event.keyCode == 13 || event.type == "focusout"){
		  event.preventDefault(); //probably not necessary
	 
		  // Get value from form element
		  var text = $(event.target).val();
		 
		  // Insert a task into the collection
		  Meteor.call("editTask", this._id, $(event.target).id, text);
	 
		  // Clear form
		  if($(event.target)){
		  $(event.target).parent().empty();
		  }
		  //Meteor.user();
		  
	  }
    }

	
	
	});

	
  
  
    Accounts.ui.config({
    passwordSignupFields: "USERNAME_ONLY"
  });
  
  
}

Meteor.methods({
  addTask: function (text) {
    // Make sure the user is logged in before inserting a task
    if (! Meteor.userId()) {
      throw new Meteor.Error("not-authorized");
    }
 
    Tasks.insert({
      text: text,
      createdAt: new Date(),
      owner: Meteor.userId(),
      username: Meteor.user().username
    });
  },
  deleteTask: function (taskId) {
	var task = Tasks.findOne(taskId);
    if (task.private && task.owner !== Meteor.userId()) {
      // If the task is private, make sure only the owner can delete it
      throw new Meteor.Error("not-authorized");
    }

    Tasks.remove(taskId);
  },
  setChecked: function (taskId, setChecked) {
	var task = Tasks.findOne(taskId);
    if (task.private && task.owner !== Meteor.userId()) {
      // If the task is private, make sure only the owner can check it off
      throw new Meteor.Error("not-authorized");
    }
 
    Tasks.update(taskId, { $set: { checked: setChecked} });
  },
  setPrivate: function (taskId, setToPrivate) {
    var task = Tasks.findOne(taskId);
 
    // Make sure only the task owner can make a task private
    if (task.owner !== Meteor.userId()) {
      throw new Meteor.Error("not-authorized");
    }
 
    Tasks.update(taskId, { $set: { private: setToPrivate } });
  },
  editTask: function(taskId, fieldName, value){
	  
	  filedName = "text"; //remove, for testing
	  
	  var task = Tasks.findOne(taskId);
	  
	  if(task.owner !== Meteor.userId()){
		  throw new Meteor.Error("not-authorized");
	  }
	  
	  Tasks.update(taskId, {$set: {fieldName: value}});
  }
});


if (Meteor.isServer) {
    // code to run on server at startup
	 // This code only runs on the server
	 // Only publish tasks that are public or belong to the current user
  Meteor.publish("tasks", function () {
    return Tasks.find({
      $or: [
        { private: {$ne: true} },
        { owner: this.userId }
      ]
    });
  });
}
