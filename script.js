"use strict";
(function() {
  var apiSerwer = "http://localhost:8080";

  class Student {
    constructor(
      data = { index: "", firstName: "", lastName: "", birthDate: "" }
    ) {
      this.index = ko.observable(data.index);
      this.firstName = ko.observable(data.firstName);
      this.lastName = ko.observable(data.lastName);
      this.birthDate = ko.observable(data.birthDate);
      this.firstName.subscribe(this.update.bind(this));
      this.lastName.subscribe(this.update.bind(this));
      this.birthDate.subscribe(this.update.bind(this));
    }

    update() {
      if (this.index()) {
        axios.put(`${apiSerwer}/students/${this.index()}`, {
          firstName: this.firstName(),
          lastName: this.lastName(),
          birthDate: this.birthDate()
        });
      }
    }
  }

  class Course {
    constructor(data = { id: "", name: "", lecturer: "" }) {
      this.id = ko.observable(data.id);
      this.name = ko.observable(data.name);
      this.lecturer = ko.observable(data.lecturer);
      this.name.subscribe(this.update.bind(this));
      this.lecturer.subscribe(this.update.bind(this));
      this.id.subscribe(this.update.bind(this));
    }

    update() {
      if (this.id()) {
        axios.put(`${apiSerwer}/courses/${ko.mapping.toJS(this.id)}`, {
          name: this.name(),
          lecturer: this.lecturer()
        });
      }
    }
  }

  class Grade {
    constructor(
      data = {
        id: "",
        value: "",
        course: null,
        date: ""
      },
      student = 0
    ) {
      this.student = student;
      this.id = ko.observable(data.id);
      this.value = ko.observable(data.value);
      this.course = ko.observable(data.course);
      this.date = ko.observable(data.date);
      this.value.subscribe(this.update.bind(this));
      this.date.subscribe(this.update.bind(this));
      this.course.subscribe(this.update.bind(this));
    }

    update() {
      if (this.student !== 0) {
        axios.put(
          `${apiSerwer}/students/${ko.mapping.toJS(
            this.student
          )}/grades/${ko.mapping.toJS(this.id)}`,
          {
            value: this.value(),
            course: this.course(),
            date: this.date()
          }
        );
      }
    }
  }

  function ProtoModel() {
    var self = this;
    self.courseToAdd = new Course();
    self.studentToAdd = new Student();
    self.gradeToAdd = new Grade();
    self.currentStudent = new Student();

    self.students = ko.observableArray([]);
    (function getStudents() {
      axios.get(`${apiSerwer}/students`).then(function(res) {
        res.data.forEach(student => {
          console.log(student);
          self.students.push(new Student(student));
        });
      });
    })();

    self.addStudent = function() {
      axios
        .post(
          `${apiSerwer}/students`,
          ko.mapping.toJS({
            firstName: this.studentToAdd.firstName,
            lastName: this.studentToAdd.lastName,
            birthDate: this.studentToAdd.birthDate
          })
        )
        .then(function(res) {
          const newStudent = new Student(res.data);
          self.students.push(ko.mapping.fromJS(newStudent));
        });

      self.studentToAdd.index("");
      self.studentToAdd.firstName("");
      self.studentToAdd.lastName("");
      self.studentToAdd.birthDate("");
    };

    self.removeStudent = function(student) {
      const remStudent = ko.mapping.toJS(student);
      axios.delete(`${apiSerwer}/students/${remStudent.index}`);
      self.students.remove(student);
    };

    self.courses = ko.observableArray([]);
    (function getCourses() {
      axios.get(`${apiSerwer}/courses`).then(function(res) {
        res.data.forEach(course => {
          self.courses.push(new Course(course));
        });
      });
    })();

    self.addCourse = function() {
      axios
        .post(
          `${apiSerwer}/courses`,
          ko.mapping.toJS({
            name: this.courseToAdd.name,
            lecturer: this.courseToAdd.lecturer
          })
        )
        .then(function(res) {
          const newCourse = new Course(res.data);
          self.courses.push(ko.mapping.fromJS(newCourse));
        });

      self.courseToAdd.name("");
      self.courseToAdd.lecturer("");
    };

    self.removeCourse = function(course) {
      const remCourse = ko.mapping.toJS(course);
      axios.delete(`${apiSerwer}/courses/${remCourse.id}`);
      self.courses.remove(course);
    };

    self.availableGrades = [2.0, 3.0, 3.5, 4.0, 4.5, 5.0];

    self.grades = ko.observableArray([]);
    self.showStudentGrades = function(student) {
      self.currentStudent = student;
      self.grades([]);
      axios
        .get(`${apiSerwer}/students/${student.index()}/grades`)
        .then(function(res) {
          res.data.forEach(grade => {
            self.grades.push(new Grade(grade, student.index()));
          });
        });
      window.location = "#student-grades";
    };

    self.addGrade = function() {
      axios
        .post(
          `${apiSerwer}/students/${self.currentStudent.index()}/grades`,
          ko.mapping.toJS({
            value: this.gradeToAdd.value,
            date: this.gradeToAdd.date,
            course: { id: this.gradeToAdd.course }
          })
        )
        .then(function(res) {
          const newGrade = new Grade(res.data, self.currentStudent.index());
          console.log(ko.mapping.toJS(newGrade));
          self.grades.push(ko.mapping.fromJS(newGrade));
        });

      self.gradeToAdd.value("");
      self.gradeToAdd.date("");
      self.gradeToAdd.course(null);
    };

    self.removeGrade = function(grade) {
      console.log(self.currentStudent.index());
      const remGrade = ko.mapping.toJS(grade);
      axios.delete(
        `${apiSerwer}/students/${self.currentStudent.index()}/grades/${
          remGrade.id
        }`
      );
      self.grades.remove(grade);
    };
  }

  window.model = new ProtoModel();

  ko.applyBindings(window.model);
})();
