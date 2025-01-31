export function process(store, order) {
  let orderCopy = [...order];

  const totalQuantity = store.reduce(
    (acc, curStore) => (acc += curStore.quantity),
    0
  );
  if (order.length > totalQuantity) return false;

  const result = { stats: [], assignment: [], mismatches: 0 };

  const updateResult = (size, id, isMatch = true) => {
    const foundSize = result.stats.find((item) => item.size === size);
    if (foundSize) {
      foundSize.quantity += 1;
    } else {
      result.stats.push({ size, quantity: 1 });
    }
    result.assignment.push({ id, size });
    if (!isMatch) result.mismatches += 1;
  };

  const stock = Object.fromEntries(
    store.map(({ size, quantity }) => [size, quantity])
  );

  const pendingOrders = {};

  const removeOrdersById = (id) => {
    for (const key in pendingOrders) {
      pendingOrders[key] = pendingOrders[key].filter((order) => order.id != id);
    }
    orderCopy = orderCopy.filter((order) => order.id != id);
  };

  for (const curOrder of order) {
    const { id, size } = curOrder;
    if (size.length === 1) {
      if (!stock[size[0]] || stock[size[0]] <= 0) {
        return false;
      }
      stock[size[0]]--;

      updateResult(size[0], id);
      removeOrdersById(id);
    } else {
      curOrder.size.forEach((curSize) => {
        pendingOrders[curSize] ??= [];
        pendingOrders[curSize].push(curOrder);
      });
    }
  }

  for (let size in pendingOrders) {
    size = Number(size);
    const currentOrders = [...pendingOrders[size]];
    for (const order of currentOrders) {
      if (!stock[size] || stock[size] === 0) {
        const [size1, size2] = order.size;

        let preferredSize = order.masterSize === 's1' ? size1 : size2;
        let alternativeSize = size === size1 ? size2 : size1;
        if (!stock[alternativeSize] || stock[alternativeSize] === 0) {
          return false;
        }

        stock[alternativeSize]--;

        updateResult(
          alternativeSize,
          order.id,
          preferredSize === alternativeSize
        );
        removeOrdersById(order.id);
      }
    }
  }

  for (const { id, size, masterSize } of orderCopy) {
    const [size1, size2] = size;

    const [preferredSize, alternativeSize] =
      masterSize === 's1' ? [size1, size2] : [size2, size1];

    if (stock[preferredSize] > 0) {
      stock[preferredSize]--;
      updateResult(preferredSize, id);
      continue;
    }

    if (stock[alternativeSize] > 0) {
      stock[alternativeSize]--;
      updateResult(alternativeSize, id, false);
      continue;
    }

    return false;
  }

  result.stats.sort((a, b) => a.size - b.size);

  return result;
}
