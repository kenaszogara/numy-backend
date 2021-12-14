const express = require("express");
const router = express.Router();
const math = require("mathjs");

const secant_method = (fn, x0, x1, iterations = 5, err = 0.0000000001) => {
  let x2;
  const coordinates = [];
  const rows = [];

  for (let i = 0; i < iterations; i++) {
    let y0 = math.evaluate(fn, { x: x0 });
    let y1 = math.evaluate(fn, { x: x1 });
    x2 = x1 - (y1 * (x1 - x0)) / (y1 - y0);

    // add x y pairs
    coordinates.push([x0, y0]);

    // add rows data
    rows.push([x0, x1, x2, y0, y1]);

    if (Math.abs(x1 - x2) <= err) {
      coordinates.push([x1, y1]);
      return { root: x1, coordinates, rows };
    }

     x0 = x1;
    x1 = x2;
  }

  coordinates.push([x2, math.evaluate(fn, { x: x2 })]);
  return { root: x2, coordinates, rows };
};

const newton_method = (fn, x0, iterations = 5, err = 0.0000000001) => {
  let x1;
  const fnd = math.derivative(fn, "x").toString();
  const coordinates = [];
  const rows = [];

  for (let i = 0; i < iterations; i++) {
    let y0 = math.evaluate(fn, { x: x0 });
    let y1 = math.evaluate(fnd, { x: x0 });
    x1 = x0 - y0 / y1;

    coordinates.push([x0, y0]);

    rows.push([x0, x1, y0, y1]);

    if (y0 == 0) {
      // coordinates.push([x1, y1]);
      return { root: x1, coordinates, rows };
    }

    x0 = x1;
  }

  // coordinates.push([x1, math.evaluate(fnd, { x: x0 })]);
  return { root: x1, coordinates, rows };
};

const false_position_method = (fn, x0, x1, iterations = 5) => {
  let x2;
  let y2;
  const rows = [];

  for (let i = 0; i < iterations; i++) {
    let y0 = math.evaluate(fn, { x: x0 });
    let y1 = math.evaluate(fn, { x: x1 });

    x2 = x0 - (y0 * (x1 - x0)) / (y1 - y0);
    let y2 = math.evaluate(fn, { x: x2 });

    rows.push([x0, x1, x2, y0, y1, y2]);

    if (y2 === 0) {
      return { root: x2, rows };
    }

    if (math.sign(y2) === math.sign(y0)) {
      x0 = x2;
    } else {
      x1 = x2;
    }
  }

  return { root: x2, rows };
};

const bisection_method = (fn, x0, x1, iterations = 5, err = 0.0000000001) => {
  let x2;
  const rows = [];

  for (let i = 0; i < iterations; i++) {
    let y0 = math.evaluate(fn, { x: x0 });
    let y1 = math.evaluate(fn, { x: x1 });

    x2 = (x0 + x1) / 2;
    let y2 = math.evaluate(fn, { x: x2 });

    // add row data
    rows.push([x0, x1, x2, y0, y1, y2]);

    if (Math.abs(x1 - x2) <= err) {
      return { root: x2, rows };
    }

    if (math.sign(y0) === math.sign(y2)) {
      x0 = x2;
    } else {
      x1 = x2;
    }
  }

  return { root: x2, rows };
};

const fixed_position_method = (
  fn,
  gn,
  x0,
  iterations = 5,
  err = 0.0000000001
) => {
  let xn;
  const rows = [];

  for (let i = 0; i < iterations; i++) {
    let y0 = math.evaluate(fn, { x: x0 });
    xn = math.evaluate(gn, { x: x0 });

    // add row data
    rows.push([x0, xn, y0]);

    if (y0 === 0) {
      return { root: xn, rows };
    }

    if (Math.abs(x0 - xn) <= err) {
      return { root: false, rows };
    }

    x0 = xn;
  }

  return { root: xn, rows };
};

const bracket_method = (fn, x0, x1, iterations = 5, err = 0.0000000001) => {
  let x2;
  const rows = [];

  for (let i = 0; i < iterations; i++) {
    let y0 = math.evaluate(fn, { x: x0 });
    let y1 = math.evaluate(fn, { x: x1 });

    x2 = (x0 + x1) / 2;
    let y2 = math.evaluate(fn, { x: x2 });

    // add row data
    rows.push([x0, x1, x2, y0, y1, y2]);

    if (Math.abs(x1 - x2) <= err) {
      return { root: x2, rows };
    }

    if (math.sign(y0) === math.sign(y2)) {
      x0 = x2;
    } else {
      x1 = x2;
    }
  }

  return { root: x2, rows };
};

/* ROUTES for MATH */
router.post("/secant", (req, res, next) => {
  const fn = req.body.fn;
  const x0 = parseInt(req.body.x0);
  const x1 = parseInt(req.body.x1);
  const n = req.body.n ? parseInt(req.body.n) : 5;
  const mE = req.body.err ? req.body.err : 0.0000000001;

  // logic for finding secant
  const { root, coordinates, rows } = secant_method(fn, x0, x1, n, mE);

  // get highest order
  const order = parseInt(fn.substring(fn.indexOf("^") + 2, 2));

  res.send({
    message: "success",
    status: 200,
    data: {
      fn,
      x: {
        x0,
        x1,
      },
      iterations: n,
      root,
      coordinates,
      rows,
      order,
    },
  });
});

router.post("/newton", (req, res, next) => {
  const fn = req.body.fn;
  const x0 = parseInt(req.body.x0);
  const n = req.body.n ? parseInt(req.body.n) : 5;
  const mE = req.body.err ? req.body.err : 0.0000000001;

  // logic for finding secant
  const { root, coordinates, rows } = newton_method(fn, x0, n, mE);

  // get highest order
  const order = parseInt(fn.substring(fn.indexOf("^") + 2, 2));

  res.send({
    message: "success",
    status: 200,
    data: {
      fn,
      x0,
      iterations: n,
      root,
      coordinates,
      order,
      rows,
    },
  });
});

router.post("/false_position", (req, res, next) => {
  const fn = req.body.fn;
  const x0 = parseInt(req.body.x0);
  const x1 = parseInt(req.body.x1);
  const n = req.body.n ? parseInt(req.body.n) : 5;
  const mE = req.body.err ? req.body.err : 0.0000000001;

  // logic for finding secant
  const { root, rows } = false_position_method(fn, x0, x1, n, mE);

  // get highest order
  const order = parseInt(fn.substring(fn.indexOf("^") + 2, 2));

  res.send({
    message: "success",
    status: 200,
    data: {
      fn,
      x: {
        x0,
        x1,
      },
      iterations: n,
      root,
      order,
      rows,
    },
  });
});

router.post("/bisection", (req, res, next) => {
  const fn = req.body.fn;
  const x0 = parseInt(req.body.x0);
  const x1 = parseInt(req.body.x1);
  const n = req.body.n ? parseInt(req.body.n) : 5;
  const mE = req.body.err ? req.body.err : 0.0000000001;

  // logic for finding secant
  const { root, rows } = bisection_method(fn, x0, x1, n, mE);

  // get highest order
  const order = parseInt(fn.substring(fn.indexOf("^") + 2, 2));

  res.send({
    message: "success",
    status: 200,
    data: {
      fn,
      x: {
        x0,
        x1,
      },
      iterations: n,
      root,
      order,
      rows,
    },
  });
});

router.post("/bracket", (req, res, next) => {
  const fn = req.body.fn;
  const x0 = parseInt(req.body.x0);
  const x1 = parseInt(req.body.x1);
  const n = req.body.n ? parseInt(req.body.n) : 5;
  const mE = req.body.err ? req.body.err : 0.0000000001;

  // logic for finding secant
  const { root, rows } = bracket_method(fn, x0, x1, n, mE);

  // get highest order
  const order = parseInt(fn.substring(fn.indexOf("^") + 2, 2));

  res.send({
    message: "success",
    status: 200,
    data: {
      fn,
      x: {
        x0,
        x1,
      },
      iterations: n,
      root,
      order,
      rows,
    },
  });
});

router.post("/fixed_position", (req, res, next) => {
  const fn = req.body.fn;
  const gn = req.body.gn;
  const x0 = parseInt(req.body.x0);
  const n = req.body.n ? parseInt(req.body.n) : 5;
  const mE = req.body.err ? req.body.err : 0.0000000001;

  // logic for finding secant
  const { root, rows } = fixed_position_method(fn, gn, x0, n, mE);

  // get highest order
  const order = parseInt(fn.substring(fn.indexOf("^") + 2, 2));

  res.send({
    message: "success",
    status: 200,
    data: {
      fn,
      gn,
      x: x0,
      iterations: n,
      root,
      order,
      rows,
    },
  });
});

module.exports = router;
