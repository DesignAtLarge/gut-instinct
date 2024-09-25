import './_.html';
import { Template } from 'meteor/templating';
import { ReactiveDict } from 'meteor/reactive-dict';
import { ReactiveVar } from 'meteor/reactive-var';

export const data = [
    { x: 34, y: 78 },
    { x: 30, y: 50 },
    { x: 67, y: 90 },
    { x: 87, y: 80 },
    { x: 40, y: 50 },
    { x: 70, y: 10 },
    { x: 35, y: 95 },
    { x: 60, y: 80 },
    { x: 80, y: 30 },
    { x: 90, y: 70 }
  ];
Template.gaMeIntuitions.rendered = (function () {

    const margin = { top: 20, right: 30, bottom: 30, left: 40 };
    const width = 800 - margin.left - margin.right;
    const height = 400 - margin.top - margin.bottom;
  
    const svg = d3.select("#scatterplot")
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);
  
    const x = d3.scaleLinear()
      .domain([0, 100])
      .range([0, width]);
  
    const y = d3.scaleLinear()
      .domain([0, 100])
      .range([height, 0]);
  
    const xAxis = d3.axisBottom(x);
    const yAxis = d3.axisLeft(y);
  
    svg.append("g")
      .attr("class", "x-axis")
      .attr("transform", `translate(0,${height})`)
      .call(xAxis);
  
    svg.append("g")
      .attr("class", "y-axis")
      .call(yAxis);
  
    // Draw points
    const circles = svg.selectAll("circle")
      .data(data)
      .enter().append("circle")
      .attr("cx", d => x(d.x))
      .attr("cy", d => y(d.y))
      .attr("r", 5)
      .attr("fill", "steelblue");
  
    // Brush setup
    const brush = d3.brush()
      .extent([[0, 0], [width, height]])
      .on("brush end", brushed);
  
    svg.append("g")
      .attr("class", "brush")
      .call(brush);
  
    function brushed(event) {
      const selection = event.selection;
  
      if (selection) {
        const [[x0, y0], [x1, y1]] = selection;
  
        circles.classed("selected", function (d) {
          return x(d.x) >= x0 && x(d.x) <= x1 && y(d.y) >= y0 && y(d.y) <= y1;
        });
      }
    }
});
Template.gaMeIntuitions.onCreated(function () {
    var inst = this;
    inst.intuitions = new ReactiveVar([]);
    Meteor.call("galileo.intuition.getMyIntuitions", function (err, result) {
        if (err) {
            alert("Server Connection Error")
        } else {
            inst.intuitions.set(result);
        }
    });
});

Template.gaMeIntuitions.helpers({
    hasIntuition: function () {
        return true;
        //Template.instance().intuitions.length() > 0;
    },
    intuitions: function () {
        return Template.instance().intuitions.get();
    }
});