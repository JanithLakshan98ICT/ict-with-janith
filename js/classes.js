const classes = [
 {grade:"06", title:"Grade 06 ICT", day:"Monday", time:"03.00 – 05.00", tag:"FOUNDATION"},
 {grade:"07", title:"Grade 07 ICT", day:"Tuesday", time:"03.00 – 05.00", tag:"DISCOVER"},
 {grade:"08", title:"Grade 08 ICT", day:"Saturday", time:"08.00 – 10.00", tag:"CREATE"},
 {grade:"09", title:"Grade 09 ICT", day:"Saturday", time:"10.30 – 12.30", tag:"BUILD"},
 {grade:"10", title:"Grade 10 ICT", day:"Wednesday", time:"03.00 – 05.30", tag:"ADVANCE"},
 {grade:"11", title:"Grade 11 ICT", day:"Saturday", time:"04.00 – 07.00", tag:"MASTER"}
];
document.getElementById("classGrid").innerHTML=classes.map(c=>`
<article class="class-card reveal">
  <div class="grade">${c.grade}<span>${c.tag}</span></div>
  <h3>${c.title}</h3><p>Theory + Practical • Smart Learning</p>
  <div class="schedule"><span>${c.day}</span><b>${c.time}</b></div>
</article>`).join("");