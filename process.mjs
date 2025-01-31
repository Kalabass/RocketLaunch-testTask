export function process(store, order) {
  let orderCopy = [...order];

  const totalQuantity = store.reduce(
    (acc, curStore) => (acc += curStore.quantity),
    0
  );
  if (order.length > totalQuantity) return false;

  const result = { stats: [], assignment: [], mismatches: 0 };

  const updateResult = (size, quantity, id, mismatch = 0) => {
    result.assignment.push({ id, size });
    result.mismatches += mismatch;
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
    switch (curOrder.size.length) {
      case 1: {
        if (!stock[curOrder.size[0]] || stock[curOrder.size[0]] <= 0) {
          return false;
        }

        stock[curOrder.size[0]]--;

        updateResult(curOrder.size[0], curOrder.size.length, curOrder.id);
        removeOrdersById(curOrder.id);

        break;
      }
      //наполняем pendingOrders
      case 2: {
        curOrder.size.forEach((curSize) => {
          pendingOrders[curSize] ??= [];
          pendingOrders[curSize].push(curOrder);
        });

        break;
      }
      default: {
        return false;
      }
    }
  }

  for (let size in pendingOrders) {
    size = Number(size);
    const currentOrders = [...pendingOrders[size]];
    for (const order of currentOrders) {
      const [size1, size2] = order.size;

      let preferredSize = order.masterSize === 's1' ? size1 : size2;
      let alternativeSize = size === size1 ? size2 : size1;

      if (!stock[size] || stock[size] === 0) {
        if (!stock[alternativeSize] || stock[alternativeSize] === 0) {
          return false;
        }

        stock[alternativeSize]--;
        const mismatch = preferredSize === alternativeSize ? 0 : 1;
        updateResult(alternativeSize, 1, order.id, mismatch);
        removeOrdersById(order.id);
      }
    }
  }

  for (const { id, size, masterSize } of orderCopy) {
    const [size1, size2] = size;
    const preferredSize = masterSize === 's1' ? size1 : size2;
    const alternativeSize = preferredSize === size1 ? size2 : size1;

    if (stock[preferredSize] > 0) {
      stock[preferredSize]--;
      updateResult(preferredSize, 1, id);
      continue;
    }

    if (stock[alternativeSize] > 0) {
      stock[alternativeSize]--;
      updateResult(alternativeSize, 1, id, 1);
      continue;
    }

    return false;
  }

  result.stats.sort((a, b) => a.size - b.size);

  return result;
}
