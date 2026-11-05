import assert from "node:assert/strict";
import { test } from "node:test";
import { parseCsv } from "@/lib/csv";

test("parses quoted fields with commas, quotes and line breaks", () => {
  const csv = 'id,name,description\r\n1,"Hinge, 4 inch","Says ""hello""\nsecond line"\n2,Plain,Text\n';
  assert.deepEqual(parseCsv(csv), [
    ["id", "name", "description"],
    ["1", "Hinge, 4 inch", 'Says "hello"\nsecond line'],
    ["2", "Plain", "Text"],
  ]);
});

test("strips a UTF-8 BOM, keeps empty cells and drops blank lines", () => {
  const csv = "﻿a,b,c\n1,,3\n\n,,\n4,5,6";
  assert.deepEqual(parseCsv(csv), [
    ["a", "b", "c"],
    ["1", "", "3"],
    ["4", "5", "6"],
  ]);
});

test("keeps a literal quote that appears mid-field", () => {
  assert.deepEqual(parseCsv('size\n3/4" pipe'), [["size"], ['3/4" pipe']]);
});
