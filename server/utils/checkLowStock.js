import Alert from '../models/Alert.js';

export const checkAndAlertLowStock = async (item) => {
  if (item.quantity <= item.minThreshold) {
    const existing = await Alert.findOne({ itemId: item._id, acknowledged: false });
    if (!existing) {
      await Alert.create({
        itemId:      item._id,
        itemName:    item.name,
        sku:         item.sku,
        quantity:    item.quantity,
        threshold:   item.minThreshold,
        severity:    item.quantity === 0 ? 'CRITICAL' : 'WARNING',
      });
    }
  } else {
    await Alert.deleteMany({ itemId: item._id, acknowledged: false });
  }
};
