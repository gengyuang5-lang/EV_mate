"""
建筑物内三维立体导航系统示例
演示如何使用导航系统进行路径规划
"""
from navigation_3d import Navigation3D


def create_sample_building():
    """创建一个示例建筑物"""
    # 创建一个20x5x20的建筑物（20x20平面，5层）
    nav = Navigation3D(width=20, height=5, depth=20)
    
    # 设置外墙为障碍物
    # 前后墙
    nav.building_map.set_obstacle_region(0, 0, 0, 19, 4, 0)
    nav.building_map.set_obstacle_region(0, 0, 19, 19, 4, 19)
    # 左右墙
    nav.building_map.set_obstacle_region(0, 0, 0, 0, 4, 19)
    nav.building_map.set_obstacle_region(19, 0, 0, 19, 4, 19)
    
    # 在每层添加一些内部障碍物（柱子、房间等）
    for floor in range(5):
        # 添加一些柱子
        nav.building_map.set_obstacle(5, floor, 5)
        nav.building_map.set_obstacle(10, floor, 10)
        nav.building_map.set_obstacle(15, floor, 15)
        
        # 添加一些房间（障碍物区域）
        # 房间1
        nav.building_map.set_obstacle_region(2, floor, 2, 4, floor, 4)
        # 房间2
        nav.building_map.set_obstacle_region(12, floor, 12, 14, floor, 14)
        # 房间3
        nav.building_map.set_obstacle_region(6, floor, 12, 8, floor, 14)
    
    # 添加楼梯（连接各楼层）
    # 楼梯1：位置(3, z=3)，连接所有楼层
    nav.building_map.add_stairs(3, 3, 0, 4, 'up')
    
    # 楼梯2：位置(17, z=17)，连接所有楼层
    nav.building_map.add_stairs(17, 17, 0, 4, 'up')
    
    # 添加电梯
    nav.building_map.add_elevator(10, 3, [0, 1, 2, 3, 4])
    nav.building_map.add_elevator(13, 16, [0, 1, 2, 3, 4])
    
    # 添加地标
    nav.add_landmark("入口", (1, 0, 1))
    nav.add_landmark("电梯A", (10, 0, 3))
    nav.add_landmark("电梯B", (13, 0, 16))
    nav.add_landmark("楼梯1", (3, 0, 3))
    nav.add_landmark("楼梯2", (17, 0, 17))
    nav.add_landmark("会议室1", (9, 2, 9))
    nav.add_landmark("会议室2", (11, 3, 11))
    nav.add_landmark("办公室", (15, 1, 5))
    
    return nav


def example1_basic_navigation():
    """示例1：基本导航"""
    print("=" * 60)
    print("示例1：基本导航 - 从入口到会议室1")
    print("=" * 60)
    
    nav = create_sample_building()
    
    start = (1, 0, 1)  # 入口
    goal = (9, 2, 9)   # 会议室1（第2层）
    
    path = nav.navigate(start, goal)
    
    if path:
        nav.visualize_path(path, show_all_floors=True)
    else:
        print("无法找到路径")


def example2_landmark_navigation():
    """示例2：使用地标导航"""
    print("\n" + "=" * 60)
    print("示例2：使用地标导航")
    print("=" * 60)
    
    nav = create_sample_building()
    
    start = nav.get_landmark("入口")
    path = nav.navigate_to_landmark(start, "会议室1")
    
    if path:
        nav.visualize_path(path, show_all_floors=True)
    else:
        print("无法找到路径")


def example3_multi_landmark_navigation():
    """示例3：经过多个地标的导航"""
    print("\n" + "=" * 60)
    print("示例3：经过多个地标的导航")
    print("=" * 60)
    
    nav = create_sample_building()
    
    start = nav.get_landmark("入口")
    landmarks = ["电梯A", "会议室1", "会议室2", "电梯B"]
    
    path = nav.navigate_through_landmarks(start, landmarks)
    
    if path:
        nav.visualize_path(path, show_all_floors=True)
    else:
        print("无法找到路径")


def example4_cross_floor_navigation():
    """示例4：跨楼层导航"""
    print("\n" + "=" * 60)
    print("示例4：跨楼层导航 - 从1层到4层")
    print("=" * 60)
    
    nav = create_sample_building()
    
    start = (1, 0, 1)  # 1层入口
    goal = (15, 4, 15)  # 4层某个位置
    
    path = nav.navigate(start, goal)
    
    if path:
        nav.visualize_path(path, show_all_floors=True)
    else:
        print("无法找到路径")


def example5_path_comparison():
    """示例5：路径比较（对角线 vs 非对角线）"""
    print("\n" + "=" * 60)
    print("示例5：路径比较 - 允许对角线 vs 不允许对角线")
    print("=" * 60)
    
    nav = create_sample_building()
    
    start = (1, 0, 1)
    goal = (18, 0, 18)
    
    # 允许对角线
    path_diagonal = nav.navigate(start, goal, allow_diagonal=True)
    # 不允许对角线
    path_no_diagonal = nav.navigate(start, goal, allow_diagonal=False)
    
    print("\n--- 允许对角线移动 ---")
    if path_diagonal:
        info = nav.get_path_info(path_diagonal)
        print(f"路径长度: {info['length']:.2f}")
        print(f"步数: {info['steps']}")
    
    print("\n--- 不允许对角线移动 ---")
    if path_no_diagonal:
        info = nav.get_path_info(path_no_diagonal)
        print(f"路径长度: {info['length']:.2f}")
        print(f"步数: {info['steps']}")


if __name__ == "__main__":
    # 运行所有示例
    example1_basic_navigation()
    example2_landmark_navigation()
    example3_multi_landmark_navigation()
    example4_cross_floor_navigation()
    example5_path_comparison()
    
    print("\n" + "=" * 60)
    print("所有示例运行完成！")
    print("=" * 60)

