use aiken/option.{and_then}

pub fn return(x: a) -> Option<a> {
  Some(x)
}

pub fn bind(m: Option<a>, f: fn(a) -> Option<b>) -> Option<b> {
  and_then(m, f)
}
