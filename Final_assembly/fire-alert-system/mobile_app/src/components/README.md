# 组件说明

## FirePointMarker
火点标记组件，用于在地图上显示火点位置。

### Props
- `level` (string): 预警级别 ('warning', 'alert', 'critical')

## AlertPopup
预警弹窗组件，显示预警详细信息。

### Props
- `alert` (object): 预警对象
- `visible` (boolean): 是否显示
- `onClose` (function): 关闭回调
- `onResolve` (function): 解决预警回调

