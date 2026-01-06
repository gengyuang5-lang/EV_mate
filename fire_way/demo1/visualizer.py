"""
3D路径可视化工具
使用matplotlib进行3D可视化（可选）
"""
try:
    import matplotlib.pyplot as plt
    from mpl_toolkits.mplot3d import Axes3D
    import numpy as np
    HAS_MATPLOTLIB = True
except ImportError:
    HAS_MATPLOTLIB = False
    print("警告：matplotlib未安装，3D可视化功能不可用")
    print("可以使用 'pip install matplotlib' 安装")


def visualize_path_3d(path, building_map=None, show_obstacles=True, 
                     title="3D路径可视化"):
    """
    在3D空间中可视化路径
    
    Args:
        path: 路径点列表 [(x, y, z), ...]
        building_map: 建筑物地图对象（可选，用于显示障碍物）
        show_obstacles: 是否显示障碍物
        title: 图表标题
    """
    if not HAS_MATPLOTLIB:
        print("matplotlib未安装，无法进行3D可视化")
        return
    
    if not path:
        print("路径为空，无法可视化")
        return
    
    fig = plt.figure(figsize=(12, 8))
    ax = fig.add_subplot(111, projection='3d')
    
    # 提取坐标
    x_coords = [p[0] for p in path]
    y_coords = [p[1] for p in path]
    z_coords = [p[2] for p in path]
    
    # 绘制路径
    ax.plot(x_coords, y_coords, z_coords, 'b-o', linewidth=2, 
            markersize=6, label='路径')
    
    # 标记起点和终点
    ax.scatter([x_coords[0]], [y_coords[0]], [z_coords[0]], 
              c='green', s=200, marker='s', label='起点')
    ax.scatter([x_coords[-1]], [y_coords[-1]], [z_coords[-1]], 
              c='red', s=200, marker='s', label='终点')
    
    # 显示障碍物（如果提供地图）
    if building_map and show_obstacles:
        obstacles = np.where(building_map.grid == 1)
        if len(obstacles[0]) > 0:
            # 只显示部分障碍物以避免过于拥挤
            step = max(1, len(obstacles[0]) // 1000)  # 最多显示1000个障碍物
            ax.scatter(obstacles[0][::step], obstacles[1][::step], 
                      obstacles[2][::step], c='gray', alpha=0.3, 
                      s=10, marker='s', label='障碍物')
    
    # 设置标签和标题
    ax.set_xlabel('X轴')
    ax.set_ylabel('Y轴（楼层）')
    ax.set_zlabel('Z轴')
    ax.set_title(title)
    ax.legend()
    
    # 设置坐标轴范围
    if building_map:
        ax.set_xlim(0, building_map.width)
        ax.set_ylim(0, building_map.height)
        ax.set_zlim(0, building_map.depth)
    
    plt.tight_layout()
    plt.show()


def visualize_path_2d_projections(path, building_map=None, 
                                  show_obstacles=True):
    """
    显示路径在三个平面上的投影
    
    Args:
        path: 路径点列表
        building_map: 建筑物地图对象
        show_obstacles: 是否显示障碍物
    """
    if not HAS_MATPLOTLIB:
        print("matplotlib未安装，无法进行可视化")
        return
    
    if not path:
        print("路径为空，无法可视化")
        return
    
    fig, axes = plt.subplots(1, 3, figsize=(18, 5))
    
    x_coords = [p[0] for p in path]
    y_coords = [p[1] for p in path]
    z_coords = [p[2] for p in path]
    
    # XY平面投影（侧视图）
    axes[0].plot(x_coords, y_coords, 'b-o', linewidth=2, markersize=4)
    axes[0].scatter([x_coords[0]], [y_coords[0]], c='green', s=100, 
                   marker='s', label='起点')
    axes[0].scatter([x_coords[-1]], [y_coords[-1]], c='red', s=100, 
                   marker='s', label='终点')
    axes[0].set_xlabel('X轴')
    axes[0].set_ylabel('Y轴（楼层）')
    axes[0].set_title('XY平面投影（侧视图）')
    axes[0].legend()
    axes[0].grid(True, alpha=0.3)
    
    # XZ平面投影（俯视图）
    axes[1].plot(x_coords, z_coords, 'b-o', linewidth=2, markersize=4)
    axes[1].scatter([x_coords[0]], [z_coords[0]], c='green', s=100, 
                   marker='s', label='起点')
    axes[1].scatter([x_coords[-1]], [z_coords[-1]], c='red', s=100, 
                   marker='s', label='终点')
    axes[1].set_xlabel('X轴')
    axes[1].set_ylabel('Z轴')
    axes[1].set_title('XZ平面投影（俯视图）')
    axes[1].legend()
    axes[1].grid(True, alpha=0.3)
    
    # YZ平面投影（正视图）
    axes[2].plot(y_coords, z_coords, 'b-o', linewidth=2, markersize=4)
    axes[2].scatter([y_coords[0]], [z_coords[0]], c='green', s=100, 
                   marker='s', label='起点')
    axes[2].scatter([y_coords[-1]], [z_coords[-1]], c='red', s=100, 
                   marker='s', label='终点')
    axes[2].set_xlabel('Y轴（楼层）')
    axes[2].set_ylabel('Z轴')
    axes[2].set_title('YZ平面投影（正视图）')
    axes[2].legend()
    axes[2].grid(True, alpha=0.3)
    
    plt.tight_layout()
    plt.show()


if __name__ == "__main__":
    # 测试可视化功能
    from navigation_3d import Navigation3D
    
    nav = Navigation3D(20, 5, 20)
    # 创建简单测试路径
    test_path = [(1, 0, 1), (5, 0, 5), (10, 1, 10), (15, 2, 15), (18, 2, 18)]
    
    print("显示3D路径可视化...")
    visualize_path_3d(test_path, nav.building_map)
    
    print("显示2D投影...")
    visualize_path_2d_projections(test_path, nav.building_map)

