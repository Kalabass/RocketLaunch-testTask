export function process(store, order) {
  let orderCopy = [...order];

  const totalQuantity = store.reduce(
    (acc, curStore) => (acc += curStore.quantity),
    0
  );
  if (order.length > totalQuantity) return false;

  const result = { stats: [], assignment: [], mismatches: 0 };

  const updateResult = (size, id, isMatch = true) => {
    result.assignment.push({ id, size });
    if (!isMatch) result.mismatches += 1;
  };

  const stock = new Map();
  for (const { size, quantity } of store) {
    stock.set(size, (stock.get(size) || 0) + quantity);
  }

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
        if (!stock.get(curOrder.size[0]) || stock.get(curOrder.size[0]) <= 0) {
          return false;
        }

        stock.set(curOrder.size[0], stock.get(curOrder.size[0]) - 1);

        updateResult(curOrder.size[0], curOrder.id);
        removeOrdersById(curOrder.id);

        break;
      }

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

      if (!stock.get(size) || stock.get(size) === 0) {
        if (!stock.get(alternativeSize) || stock.get(alternativeSize) === 0) {
          return false;
        }

        stock.set(alternativeSize, stock.get(alternativeSize) - 1);
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

    if (stock.get(preferredSize) > 0) {
      stock.set(preferredSize, stock.get(preferredSize) - 1);
      updateResult(preferredSize, id);
      continue;
    }

    if (stock.get(alternativeSize) > 0) {
      stock.set(alternativeSize, stock.get(alternativeSize) - 1);
      updateResult(alternativeSize, id, false);
      continue;
    }

    return false;
  }

  result.stats.sort((a, b) => a.size - b.size);

  return result;
}
