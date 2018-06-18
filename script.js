(function() {
  "use strict";

  var apiSerwer = "http://localhost:8080";

  class Student {
    constructor(data) {
      this.firstName = ko.observable(data.firstName);
      this.lastName = ko.observable(data.lastName);
      this.birthDate = ko.observable(data.birthDate);
      this.index = ko.observable(data.index);
    }
  }

  class Course {
    constructor(data) {
      this.id = ko.observable(data.id);
      this.name = ko.observable(data.name);
      this.lecturer = ko.observable(data.lecturer);
      this.name.subscribe(function(newName) {
        console.log(newName);
      });
      this.lecturer.subscribe(function(newLecturer) {
        console.log(newLecturer);
      });
    }

    update() {
      axios.put(
        `${apiSerwer}/courses/${ko.mapping.toJS(this.id)}`,
        ko.mapping.toJS({ name: this.name, lecturer: this.lecturer })
      );
    }
  }

  function ProtoModel() {
    var self = this;

    self.newCourseNameText = ko.observable();
    self.newCourseLecturerText = ko.observable();

    self.courses = ko.observableArray([]);
    (function getCourses() {
      axios.get(`${apiSerwer}/courses`).then(function(res) {
        self.courses(ko.mapping.toJS(res.data));
      });
    })();

    self.removeCourse = function(course) {
      const remCourse = ko.mapping.toJS(course);
      axios.delete(`${apiSerwer}/courses/${remCourse.id}`);
      self.courses.remove(course);
    };

    self.updateCourse = function(course) {
      console.log(ko.mapping.toJS(course));
      const updaCourse = ko.mapping.toJS(course);

      axios.put(`${apiSerwer}/courses/${updaCourse.id}`, updaCourse);
    };

    self.addCourse = function() {
      const newCourse = new Course({
        name: this.newCourseNameText(),
        lecturer: this.newCourseLecturerText()
      });

      axios
        .post(`${apiSerwer}/courses`, ko.mapping.toJS(newCourse))
        .then(function(res) {
          self.courses.push(ko.mapping.fromJS(res.data));
        });

      self.newCourseNameText("");
      self.newCourseLecturerText("");
    };

    self.students = ko.observableArray([]);
    (function getStudents() {
      axios.get(`${apiSerwer}/students`).then(function(res) {
        self.students(res.data);
      });
    })();
  }

  var model = new ProtoModel();

  ko.applyBindings(model);
})();
