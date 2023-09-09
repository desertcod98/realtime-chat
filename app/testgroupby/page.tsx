"use client";

export default function Test(){
  fetch("/api/chat", {
    method: "POST",
    body: JSON.stringify({userEmail: "a@a.a"})
  }).then(res => res.json().then(json => console.log(json)));

  return (
    <span>test</span>
  )
}