/*
	1.Сравниваем количество заказов и общее количество масок на складе
		1.1 Если масок на складе меньше - возвращаем false
	2.итерируемся по заказам
		2.1 Для заказов с одним размер сразу проверяем склад
			2.2 при отсутствии размера - возвращаем false
			2.3 при наличии размера - обновляем result, уменьшаем количество на складе и удаляем заказ из orderCopy
		2.2 Заказы с двумя размерами упаковываем в pendingOrders
	3.Итерируемся по pendingOrders
    3.1. Находим те заказы, один из размеров которых отсутствует на складе, для них:
      3.1.1 Находим второй размер и проверяем склад на наличие 2 размера
        3.1.1.1 Если и второго размера нет - возвращаем false 
        3.1.1.2 Если второй размер есть - обновляем result, уменьшаем количество на складе и удаляем заказ из pendingOrders и orderCopy
  4. Итерируемся по orderCopy
    4.1 Проверяем есть ли предпочтительный размер на складе
      4.1.1 Если есть - обновляем result и уменьшаем количество на складе 
      4.1.2 Если нет - проверяем есть ли непредпочтительный размер на складе
        4.1.2.1 Если есть - обновляем result и уменьшаем количество на складе 
        4.1.2.2 Если нет - возвращаем false
  5. сортируем stats в result
  6. возвращаем result
 */

export function process(store, order) {
  let orderCopy = [...order];

  const totalQuantity = store.reduce(
    (acc, curStore) => (acc += curStore.quantity),
    0
  );
  if (order.length > totalQuantity) return false;

  const stock = Object.fromEntries(
    store.map(({ size, quantity }) => [size, quantity])
  );

  const pendingOrders = {};

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
