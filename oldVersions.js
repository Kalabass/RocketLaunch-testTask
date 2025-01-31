/*
Фулл алго:
	1.Сравниваем количество заказов и общее количество масок в магазине
		1.1 Если масок в магазине меньше - возвращаем false
	2.итерируемся по заказам
		2.1 Для заказов с одним размер сразу проверяем склад
			2.2 при отсутствии размера - возвращаем false
			2.3 при наличии размера - обновляем result и уменьшаем количество на складе
		2.2 Заказы с двумя размерами упаковываем в pendingOrders
		2.3 Если заказ с другим количеством размеров - возвращаем false
	3.Итерируемся по pendingOrders
    3.1. Находим те заказы, один из размеров которых отсутствует в магазине, для них:
      3.1.1 Находим второй размер и проверяем магазин на наличие 2 размера
        3.1.1.1 Если и второго размера нет - возвращаем false 
        3.1.1.2 Если второй размер есть - обновляем result и удаляем заказ из pendingOrders
  4. Итерируемся по orderCopy, при возможности выдаем предпочитаемый размер
 */

//0.1  первая версия, которую я почти довел до ума, работала только, если были заказы длины 1
export function process(store, order) {
  const totalQuantity = store.reduce(
    (acc, curStore) => (acc += curStore.quantity),
    0
  );
  if (order.length > totalQuantity) return false;

  const result = { stats: [], assignment: [], mismatches: 0 };

  const updateResult = (size, quantity, id, mismatches = 0) => {
    //TODO: возможно лучше сделать по-другому
    result.stats.push({
      size,
      quantity,
    });

    result.assignment.push({ id, size: size });

    result.mismatches += mismatches;
  };

  const stock = store.reduce((acc, curStore) => {
    acc[curStore.size] = curStore.quantity;
    return acc;
  }, {});

  const pendingOrders = {};

  const removeOrdersById = (id) => {
    for (const key in pendingOrders) {
      pendingOrders[key] = pendingOrders[key].filter((order) => order.id != id);
    }
  };

  for (const curOrder of order) {
    switch (curOrder.size.length) {
      //избавляемся от заказов с одним сайзом:
      case 1: {
        if (!stock[curOrder.size[0]] || stock[curOrder.size[0]] <= 0) {
          return false;
        }

        stock[curOrder.size[0]]--;

        updateResult(curOrder.size[0], curOrder.size.length, curOrder.id);

        break;
      }
      //наполняем pendingOrders
      case 2: {
        curOrder.size.forEach((curSize) => {
          pendingOrders[curSize] = pendingOrders[curSize]
            ? pendingOrders[curSize]
            : [];
          pendingOrders[curSize].push(curOrder);
        });

        break;
      }
      default: {
        return false;
      }
    }
  }

  for (let orderKey in pendingOrders) {
    // console.log(pendingOrders[orderKey]);
    //Случай, когда на один размер один заказ
    if (pendingOrders[orderKey].length === 1) {
      //Когда на один размер один заказ и размера нет на складе

      if (!stock[orderKey] || stock[orderKey] <= 0) {
        const preferredSize =
          pendingOrders[orderKey][0].masterSize === 's1'
            ? pendingOrders[orderKey][0].size[0]
            : pendingOrders[orderKey][0].size[1];

        const alternativeSize =
          pendingOrders[orderKey][0].size[0] === orderKey
            ? pendingOrders[orderKey][0].size[0]
            : pendingOrders[orderKey][0].size[1];

        if (!stock[alternativeSize] || stock[alternativeSize] <= 0) {
          return false;
        }

        stock[alternativeSize]--;

        let mismatch = alternativeSize === preferredSize ? 0 : 1;

        updateResult(
          alternativeSize,
          1,
          pendingOrders[orderKey][0].id,
          mismatch
        );

        removeOrdersById(pendingOrders[orderKey][0].id);

        continue;
      }

      //Когда на один размер один заказ и размер есть на складе
      if (stock[orderKey] > 0) {
        const preferredSize =
          pendingOrders[orderKey][0].masterSize === 's1'
            ? pendingOrders[orderKey][0].size[0]
            : pendingOrders[orderKey][0].size[1];

        const alternativeSize =
          pendingOrders[orderKey][0].size[0] === orderKey
            ? pendingOrders[orderKey][0].size[0]
            : pendingOrders[orderKey][0].size[1];

        if (pendingOrders[alternativeSize].length > 1) {
          continue;
        }

        if (stock[alternativeSize] <= 0) {
          //TODO: добавить добавление в результат
          stock[orderKey]--;

          let mismatch = preferredSize === orderKey ? 0 : 1;
          updateResult(orderKey, 1, pendingOrders[orderKey][0].id, mismatch);
          removeOrdersById(pendingOrders[orderKey][0].id);
          continue;
        }
        //Когда на 2 размера по одному заказу - выбираем предпочтительный

        stock[preferredSize]--;
        updateResult(preferredSize, 1, pendingOrders[orderKey][0].id);
        removeOrdersById(pendingOrders[orderKey][0].id);
        continue;
      }
    }
  }

  result.stats.sort((a, b) => a.size - b.size);

  return result;
}

//1.0  работающая но некрасивая версия
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
