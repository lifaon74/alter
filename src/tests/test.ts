
export async function test1() {
  console.log('tested');
}

export async function test() {
  await test1();
}
