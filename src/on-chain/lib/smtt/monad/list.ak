use aiken/collection/list.{flat_map}

pub fn return(x: a) -> List<a> {
  [x]
}

pub fn bind(m: List<a>, f: fn(a) -> List<b>) -> List<b> {
  flat_map(m, f)
}
